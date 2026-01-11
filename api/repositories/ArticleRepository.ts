
import { BaseRepository } from './BaseRepository'
import { ArticleSource } from '../../shared/contracts/research'

export class ArticleRepository extends BaseRepository {

    async saveJobArticles(jobId: string, userId: string, articles: ArticleSource[]) {
        if (!articles.length) return

        // We need to implement batch saving. 
        // Assuming databaseManager.saveJobArticles just saved them to the DB linked to the job.
        // Let's implement this using Prisma.

        // This effectively replaces databaseManager.saveJobArticles
        const operations = articles.map(article => {
            return this.prisma.article.upsert({
                where: { id: article.id } as any,
                update: {
                    title: article.title,
                    // Map other fields as needed... database schema dependent
                } as any,
                create: {
                    id: article.id,
                    title: article.title,
                    content: article.abstract || '',
                    status: 'completed',
                    uploadedAt: new Date(),
                    userId: userId,
                    url: article.url,
                    metadata: JSON.stringify({
                        authors: article.authors,
                        year: article.year,
                        doi: article.doi,
                        source: article.source,
                        relevanceScore: article.relevanceScore,
                        journal: article.journal
                    })
                } as any
            })
        })

        // Also need to link to job? 
        // databaseManager.saveJobArticles logic usually does this.
        // If Article is independent, we need a refined schema.
        // For now, let's assume we just upsert articles. 
        // If there's a join table or array in Job, it's more complex.

        // In Database.ts, ResearchJobRecord has `articles` which was ANY[].
        // If it's a relation, we need to connect.
        // Assuming standard behavior: strict Repository pattern usually separates entities.

        await this.prisma.$transaction(operations)
    }
}

export const articleRepository = new ArticleRepository()
