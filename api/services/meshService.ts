/**
 * MeSH (Medical Subject Headings) API Service
 * 
 * Uses the NLM (National Library of Medicine) REST API
 * https://meshb.nlm.nih.gov/api
 * 
 * Free to use, no API key required
 */

import { logger } from '../core/Logger'

// Cache for MeSH lookups to reduce API calls
const meshCache = new Map<string, MeSHDescriptor | null>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export interface MeSHDescriptor {
    descriptorUI: string          // e.g., "D004194"
    descriptorName: string        // Official name
    treeNumbers: string[]         // MeSH tree hierarchy
    scopeNote?: string            // Description
    synonyms: string[]            // Alternative names
    category: MeSHCategory
}

type MeSHCategory =
    | 'disease'      // C - Diseases
    | 'drug'         // D - Chemicals and Drugs
    | 'anatomy'      // A - Anatomy
    | 'organism'     // B - Organisms
    | 'technique'    // E - Analytical, Diagnostic and Therapeutic Techniques
    | 'psychiatry'   // F - Psychiatry and Psychology
    | 'biological'   // G - Phenomena and Processes
    | 'organism_descriptor' // H - Disciplines and Occupations
    | 'anthropology' // I - Anthropology, Education, Sociology
    | 'technology'   // J - Technology, Industry, Agriculture
    | 'humanities'   // K - Humanities
    | 'information'  // L - Information Science
    | 'person'       // M - Named Groups
    | 'health_care'  // N - Health Care
    | 'publication'  // V - Publication Characteristics
    | 'geographic'   // Z - Geographicals
    | 'unknown'

export interface MeSHSearchResult {
    found: boolean
    descriptor?: MeSHDescriptor
    confidence: number
    matchType: 'exact' | 'synonym' | 'partial' | 'none'
}

const BASE_URL = 'https://id.nlm.nih.gov/mesh'

/**
 * Map MeSH tree number prefix to category
 */
function getCategory(treeNumbers: string[]): MeSHCategory {
    if (!treeNumbers.length) return 'unknown'

    const prefix = treeNumbers[0].charAt(0)
    const categoryMap: Record<string, MeSHCategory> = {
        'A': 'anatomy',
        'B': 'organism',
        'C': 'disease',
        'D': 'drug',
        'E': 'technique',
        'F': 'psychiatry',
        'G': 'biological',
        'H': 'organism_descriptor',
        'I': 'anthropology',
        'J': 'technology',
        'K': 'humanities',
        'L': 'information',
        'M': 'person',
        'N': 'health_care',
        'V': 'publication',
        'Z': 'geographic',
    }

    return categoryMap[prefix] || 'unknown'
}

/**
 * Search MeSH for a term
 */
export async function searchMeSH(term: string): Promise<MeSHSearchResult> {
    const cacheKey = term.toLowerCase().trim()

    // Check cache
    if (meshCache.has(cacheKey)) {
        const cached = meshCache.get(cacheKey)
        return {
            found: cached !== null,
            descriptor: cached || undefined,
            confidence: cached ? 1.0 : 0,
            matchType: cached ? 'exact' : 'none'
        }
    }

    try {
        // Use SPARQL endpoint for search
        const query = encodeURIComponent(term)
        const url = `${BASE_URL}/sparql?query=${encodeURIComponent(`
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX meshv: <http://id.nlm.nih.gov/mesh/vocab#>
      
      SELECT ?d ?name ?scopeNote ?treeNumber
      WHERE {
        ?d a meshv:Descriptor .
        ?d rdfs:label ?name .
        OPTIONAL { ?d meshv:scopeNote ?scopeNote }
        OPTIONAL { ?d meshv:treeNumber ?treeNumber }
        FILTER(CONTAINS(LCASE(?name), LCASE("${term}")))
      }
      LIMIT 5
    `)}&format=json`

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/sparql-results+json'
            }
        })

        if (!response.ok) {
            throw new Error(`MeSH API error: ${response.status}`)
        }

        const data = await response.json()
        const bindings = data.results?.bindings || []

        if (bindings.length === 0) {
            meshCache.set(cacheKey, null)
            return { found: false, confidence: 0, matchType: 'none' }
        }

        // Find best match
        const exactMatch = bindings.find((b: any) =>
            b.name?.value?.toLowerCase() === term.toLowerCase()
        )

        const bestMatch = exactMatch || bindings[0]

        // Extract descriptor info
        const descriptorUI = bestMatch.d?.value?.split('/').pop() || ''
        const treeNumbers = bindings
            .filter((b: any) => b.d?.value === bestMatch.d?.value && b.treeNumber?.value)
            .map((b: any) => b.treeNumber.value)

        const descriptor: MeSHDescriptor = {
            descriptorUI,
            descriptorName: bestMatch.name?.value || term,
            treeNumbers,
            scopeNote: bestMatch.scopeNote?.value,
            synonyms: [],
            category: getCategory(treeNumbers)
        }

        meshCache.set(cacheKey, descriptor)

        return {
            found: true,
            descriptor,
            confidence: exactMatch ? 1.0 : 0.8,
            matchType: exactMatch ? 'exact' : 'partial'
        }
    } catch (error) {
        logger.error('MeSHService', 'Failed to search MeSH', { term, error })
        return { found: false, confidence: 0, matchType: 'none' }
    }
}

/**
 * Lookup MeSH descriptor by ID
 */
export async function getMeSHDescriptor(descriptorUI: string): Promise<MeSHDescriptor | null> {
    const cacheKey = `id:${descriptorUI}`

    if (meshCache.has(cacheKey)) {
        return meshCache.get(cacheKey) || null
    }

    try {
        const url = `${BASE_URL}/${descriptorUI}.json`
        const response = await fetch(url)

        if (!response.ok) {
            return null
        }

        const data = await response.json()

        const descriptor: MeSHDescriptor = {
            descriptorUI,
            descriptorName: data.label?.['@value'] || descriptorUI,
            treeNumbers: data.treeNumber || [],
            scopeNote: data.scopeNote?.['@value'],
            synonyms: data.altLabel?.map((a: any) => a['@value']) || [],
            category: getCategory(data.treeNumber || [])
        }

        meshCache.set(cacheKey, descriptor)
        return descriptor
    } catch (error) {
        logger.error('MeSHService', 'Failed to get MeSH descriptor', { descriptorUI, error })
        return null
    }
}

/**
 * Normalize a term using MeSH
 * Returns the canonical MeSH preferred term if found
 */
export async function normalizeTerm(term: string): Promise<{
    normalized: string
    meshId?: string
    category?: MeSHCategory
    confidence: number
}> {
    const result = await searchMeSH(term)

    if (result.found && result.descriptor) {
        return {
            normalized: result.descriptor.descriptorName,
            meshId: result.descriptor.descriptorUI,
            category: result.descriptor.category,
            confidence: result.confidence
        }
    }

    return {
        normalized: term,
        confidence: 0
    }
}

/**
 * Batch normalize multiple terms
 */
export async function normalizeTerms(terms: string[]): Promise<Map<string, {
    normalized: string
    meshId?: string
    category?: MeSHCategory
    confidence: number
}>> {
    const results = new Map()

    // Process in batches to avoid overwhelming the API
    const batchSize = 5
    for (let i = 0; i < terms.length; i += batchSize) {
        const batch = terms.slice(i, i + batchSize)
        const batchResults = await Promise.all(batch.map(normalizeTerm))

        batch.forEach((term, j) => {
            results.set(term, batchResults[j])
        })

        // Small delay between batches
        if (i + batchSize < terms.length) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
    }

    return results
}

/**
 * Check if a term is a disease
 */
export async function isDisease(term: string): Promise<boolean> {
    const result = await searchMeSH(term)
    return result.found && result.descriptor?.category === 'disease'
}

/**
 * Check if a term is a drug
 */
export async function isDrug(term: string): Promise<boolean> {
    const result = await searchMeSH(term)
    return result.found && result.descriptor?.category === 'drug'
}

/**
 * Clear the MeSH cache
 */
export function clearMeSHCache(): void {
    meshCache.clear()
    logger.info('MeSHService', 'Cache cleared')
}

/**
 * Get cache statistics
 */
export function getMeSHCacheStats(): { size: number; hitRate: string } {
    return {
        size: meshCache.size,
        hitRate: 'N/A' // Would need to track hits/misses
    }
}
