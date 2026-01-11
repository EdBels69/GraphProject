
import { ResearchJob, ResearchJobRequest, ArticleSource, ResearchSource } from '../../../shared/contracts/research'
import { jobManager } from '../jobs/JobManager'
import globalSearch from '../globalSearch'
import { logger } from '../../core/Logger'
import { chatCompletion } from '../aiService'
import { isFeatureEnabled } from '../../../shared/config/features'

export class SearchOrchestrator {

    /**
     * Main entry point for the search phase
     */
    async executeSearchPhase(job: ResearchJob, request: ResearchJobRequest): Promise<ArticleSource[]> {
        const sources = request.sources || ['pubmed', 'crossref']
        const targetHighRelevance = 15 // Goal for high-quality matches
        const { fromDate, toDate, scopusQuartile, wosQuartile, sjrQuartile, minImpactFactor } = request
        const maxArticles = 10000

        await jobManager.updateJobStatus(job.id, 'searching', 'Generating queries...')
        await jobManager.updateProgress(job.id, 5)

        // Use raw topic directly as requested by USER
        job.queries = [request.topic]

        // Generate AI queries if enabled
        if (isFeatureEnabled('USE_AI_FEATURES')) {
            const aiQueries = await this.generateQueries(request.topic)
            // Add unique AI queries
            for (const q of aiQueries) {
                if (!job.queries.includes(q)) job.queries.push(q)
            }
        }

        await jobManager.persistJob(job)
        jobManager.log(job.id, 'search', `Executing search for: "${request.topic}"`)

        await jobManager.updateJobStatus(job.id, 'searching', 'Querying databases...')
        await jobManager.updateProgress(job.id, 15)
        jobManager.log(job.id, 'search', `Searching sources: ${sources.join(', ')}...`)

        // Execute search
        const onProgress = async (source: string, count: number) => {
            job.articlesFound = (job.articlesFound || 0) + count
            await jobManager.persistJob(job)
            jobManager.log(job.id, 'info', `Source ${source} found ${count} articles`)
        }

        logger.info('SearchOrchestrator', `executeSearchPhase calling searchSources`, { queries: job.queries, fromDate, toDate })
        let articles = await this.searchSources(job.queries, sources, maxArticles, fromDate, toDate, onProgress)
        jobManager.log(job.id, 'info', `Search API returned ${articles.length} raw articles`)

        // Apply metric filtering if requested
        if (scopusQuartile || wosQuartile || sjrQuartile || (minImpactFactor && minImpactFactor > 0)) {
            jobManager.log(job.id, 'info', `Filtering by metrics: Scopus >= ${scopusQuartile || 'Any'}, WoS >= ${wosQuartile || 'Any'}, IF >= ${minImpactFactor || 0}`)
            articles = articles.filter(a => {
                const passesScopus = !scopusQuartile || scopusQuartile.length === 0 || (a.scopusQuartile && scopusQuartile.includes(a.scopusQuartile as any))
                const passesWoS = !wosQuartile || wosQuartile.length === 0 || (a.wosQuartile && wosQuartile.includes(a.wosQuartile as any))
                const passesSJR = !sjrQuartile || sjrQuartile.length === 0 || (a.sjrQuartile && sjrQuartile.includes(a.sjrQuartile as any))
                const passesIF = !minImpactFactor || (a.impactFactor || 0) >= minImpactFactor
                return passesScopus && passesWoS && passesSJR && passesIF
            })
        }

        // Scoring and Refinement enabled
        articles = await this.scoreArticles(articles, job.topic)

        // If results are low, try to refine
        if (articles.length < 5 && isFeatureEnabled('USE_AI_FEATURES')) {
            const refinements = await this.refineQueriesWithAI(request.topic, articles)
            if (refinements.length > 0) {
                jobManager.log(job.id, 'ai', `Refining search with new queries: ${refinements.join(', ')}`)
                const refinedArticles = await this.searchSources(refinements, sources, maxArticles, fromDate, toDate)
                articles = [...articles, ...refinedArticles]
                // Re-score merged
                articles = await this.scoreArticles(articles, job.topic)
            }
        }

        job.articlesFound = articles.length
        job.articles = articles

        logger.info('SearchOrchestrator', `Search phase completed. Total articles: ${articles.length}`)
        jobManager.log(job.id, 'success', `Found total ${articles.length} articles`)

        return articles
    }

    /**
     * Search multiple sources with fallback to broader search
     */
    private async searchSources(
        queries: string[],
        sources: ResearchSource[],
        maxResults: number,
        fromDate?: string,
        toDate?: string,
        onProgress?: (source: string, count: number) => void
    ): Promise<ArticleSource[]> {
        logger.info('SearchOrchestrator', `searchSources called with:`, { queries, sources, maxResults, fromDate, toDate })
        const allArticles: ArticleSource[] = []
        const seenDois = new Set<string>()

        const addResults = (results: any[]) => {
            for (const result of results) {
                if (result.doi && seenDois.has(result.doi)) continue
                if (result.doi) seenDois.add(result.doi)

                allArticles.push({
                    id: result.id,
                    doi: result.doi,
                    title: result.title,
                    authors: result.authors,
                    year: result.year,
                    abstract: result.abstract,
                    url: result.url,
                    source: result.source as ResearchSource,
                    status: 'pending',
                    relevanceScore: result.relevanceScore,
                    impactFactor: result.impactFactor,
                    scopusQuartile: result.scopusQuartile,
                    wosQuartile: result.wosQuartile,
                    sjrQuartile: result.sjrQuartile,
                    journal: result.journal,
                    issn: result.issn,
                    references: result.references
                })
            }
        }

        // Try each query
        for (const query of queries.slice(0, 8)) {
            if (allArticles.length >= maxResults) break

            try {
                logger.info('SearchOrchestrator', `Searching: "${query}"`)
                const results = await globalSearch.search({
                    query,
                    sources,
                    maxResults: Math.ceil(maxResults / 2),
                    fromDate,
                    toDate,
                    onProgress
                })
                addResults(results.results)
                logger.info('SearchOrchestrator', `Query "${query}" returned ${results.results.length} results`)
            } catch (error) {
                logger.warn('SearchOrchestrator', `Search failed for query: ${query}`, { error })
            }
        }

        // FALLBACK: If too few results found, try broader search
        if (allArticles.length < (maxResults / 4) && queries.length > 0) {
            logger.info('SearchOrchestrator', `Only ${allArticles.length} results found, trying broader search...`)

            for (const q of queries.slice(0, 2)) {
                if (allArticles.length >= (maxResults / 2)) break

                const broadQuery = q.split(' ').filter(w => w.length > 3).slice(0, 3).join(' ')
                if (!broadQuery) continue

                try {
                    const results = await globalSearch.search({
                        query: broadQuery,
                        sources,
                        maxResults: Math.ceil(maxResults / 2),
                        fromDate,
                        toDate,
                        onProgress
                    })
                    addResults(results.results)
                    logger.info('SearchOrchestrator', `Fallback search "${broadQuery}" added ${results.results.length} results`)
                } catch (error) {
                    logger.warn('SearchOrchestrator', `Fallback search failed for ${broadQuery}`, { error })
                }
            }
        }

        logger.info('SearchOrchestrator', `Total unique articles found: ${allArticles.length}`)
        return allArticles.slice(0, maxResults)
    }

    /**
     * Generate search queries from topic using AI
     */
    async generateQueries(topic: string): Promise<string[]> {
        const queries: string[] = [topic]

        if (!isFeatureEnabled('USE_AI_FEATURES')) {
            return queries
        }

        try {
            const response = await chatCompletion([
                {
                    role: 'system',
                    content: `You are a biomedical search assistant. Given a research topic (which might be in Russian or another language), generate 3 effective search query variations for PubMed in ENGLISH.
Rules:
- ALWAYS translate non-English topics to English
- Keep queries SHORT (2-4 words max)
- Use standard MeSH terms where possible
- Do NOT add complex operators
Return ONLY a JSON array of 3 strings.`
                },
                {
                    role: 'user',
                    content: `Topic: "${topic}"
Generate 3 English search query variations:`
                }
            ], { temperature: 0.3 })

            const cleaned = response.content.replace(/```json\n?/g, '').replace(/```/g, '').trim()
            const aiQueries = JSON.parse(cleaned)

            if (Array.isArray(aiQueries)) {
                for (const q of aiQueries.slice(0, 3)) {
                    if (typeof q === 'string' && q.length > 2 && !queries.includes(q)) {
                        queries.push(q)
                    }
                }
            }

            if (queries.length === 0) queries.push(topic)

            logger.info('SearchOrchestrator', `Generated ${queries.length} search queries`, { queries })
            return queries
        } catch (error) {
            logger.warn('SearchOrchestrator', 'Failed to generate queries with AI, using original topic only', { error })
            if (!queries.includes(topic)) {
                queries.push(topic)
            }
            return queries
        }
    }

    /**
     * Iteratively refine search based on partially found results
     */
    private async refineQueriesWithAI(topic: string, partialArticles: ArticleSource[]): Promise<string[]> {
        // Collect titles and abstracts 
        const context = partialArticles.slice(0, 5).map(a => `Title: ${a.title}\nKeywords: ${a.keywords?.join(', ')}`).join('\n\n')

        try {
            const response = await chatCompletion([
                {
                    role: 'system',
                    content: `You are a research assistant helping to refine search queries.
The user is researching: "${topic}".
They found some initial results, but maybe not enough or slightly off-target.
Based on the initial results found so far, suggest 2 NEW, BETTER search queries to find more relevant papers.`
                },
                {
                    role: 'user',
                    content: `Found papers:\n${context}\n\nSuggest 2 new search queries (JSON array of strings):`
                }
            ], { temperature: 0.4 })

            const cleaned = response.content.replace(/```json\n?/g, '').replace(/```/g, '').trim()
            const newQueries = JSON.parse(cleaned)
            return Array.isArray(newQueries) ? newQueries.filter(q => typeof q === 'string') : []
        } catch (error) {
            logger.warn('SearchOrchestrator', 'Failed to refine queries', { error })
            return []
        }
    }

    /**
     * Score articles by relevance using AI
     */
    async scoreArticles(articles: ArticleSource[], topic: string): Promise<ArticleSource[]> {
        if (!isFeatureEnabled('USE_AI_FEATURES') || articles.length === 0) {
            return articles.map(a => ({ ...a, relevanceScore: 0.5 }));
        }

        // Process in batches of 10 to be efficient
        const batchSize = 10;
        const scoredArticles = [...articles];

        for (let i = 0; i < scoredArticles.length; i += batchSize) {
            const batch = scoredArticles.slice(i, i + batchSize);
            const prompt = batch.map((a, idx) => `${idx}. Title: ${a.title}\nAbstract summary: ${a.abstract?.substring(0, 200)}...`).join('\n\n');

            try {
                const response = await chatCompletion([
                    {
                        role: 'system',
                        content: `Rate the relevance of these scientific papers to the topic: "${topic}".\nScore each from 0.0 (Irrelevant) to 1.0 (Highly Relevant).\nReturn JSON: {"scores": [score0, score1, ...]}`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ], { temperature: 0.1 });

                const cleaned = response.content.replace(/```json\n?/g, '').replace(/```/g, '').trim();
                const data = JSON.parse(cleaned);

                if (data.scores && Array.isArray(data.scores)) {
                    data.scores.forEach((score: number, idx: number) => {
                        if (scoredArticles[i + idx]) {
                            scoredArticles[i + idx].relevanceScore = score;
                            // Map to internal screening status if very high
                            if (score >= 0.85) scoredArticles[i + idx].screeningStatus = 'recommended';
                        }
                    });
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                if (errorMsg.includes('All AI providers are currently unavailable')) {
                    logger.warn('SearchOrchestrator', 'Skipping AI scoring - AI service globally offline');
                    return scoredArticles.map(a => ({ ...a, relevanceScore: a.relevanceScore || 0.5 }));
                }
                logger.warn('SearchOrchestrator', `Failed to score batch ${i}`, { error });
            }
        }

        // Sort by score
        return scoredArticles.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }
}

export const searchOrchestrator = new SearchOrchestrator()
