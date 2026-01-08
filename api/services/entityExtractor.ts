/**
 * Enhanced Entity Extractor with MeSH Integration
 * 
 * Combines regex patterns with MeSH API for better accuracy
 */

import { Chunk } from './chunkingEngine'
import { searchMeSH, normalizeTerm, MeSHSearchResult } from './meshService'
import { logger } from '../../src/core/Logger'
import { isFeatureEnabled } from '../../shared/config/features'
import { extractEntitiesWithAI } from './aiService'

export interface Entity {
  id: string
  name: string
  normalizedName?: string
  type: 'protein' | 'gene' | 'metabolite' | 'pathway' | 'complex' | 'disease' | 'drug'
  confidence: number
  evidence: string[]
  mentions: number
  source: string
  position: number
  meshId?: string
  meshCategory?: string
}

export interface ExtractedEntities {
  entities: Entity[]
  relations: Array<{ source: string; target: string; type: string; confidence: number }>
  statistics: {
    totalEntities: number
    byType: Record<string, number>
    totalRelations: number
    meshNormalized: number
  }
}

export class EntityExtractor {
  private patterns: Map<string, RegExp>
  private useMeSH: boolean
  private useAI: boolean

  constructor() {
    this.patterns = new Map()
    this.initializePatterns()
    this.useMeSH = isFeatureEnabled('USE_MESH_LOOKUP')
    this.useAI = isFeatureEnabled('USE_AI_EXTRACTION')
  }

  private initializePatterns(): void {
    // Protein patterns (UniProt/Ensembl style names)
    this.patterns.set('protein', /\b(?:p53|TP53|BRCA1|BRCA2|MDM2|BAX|BCL2|EGFR|HER2|KRAS|BRAF|PTEN|AKT|mTOR|RAF|MEK|ERK|JNK|MAPK|PI3K|JAK|STAT|NF-?kB|TNF|IL-?\d+|IFN|TGF|VEGF|FGF|IGF|EGF|PDGF|HGF)[a-z0-9]?\b/gi)

    // Gene patterns (HGNC style)
    this.patterns.set('gene', /\b[A-Z][A-Z0-9]{1,5}(?:\d)?(?:-[A-Z0-9]+)?\b/g)

    // Metabolite patterns
    this.patterns.set('metabolite', /\b(?:glucose|pyruvate|lactate|ATP|ADP|AMP|NAD|NADH|NADP|NADPH|FAD|FADH2|CoA|acetyl-CoA|citrate|succinate|fumarate|malate|oxaloacetate|alpha-ketoglutarate|glutamate|glutamine|aspartate|asparagine)\b/gi)

    // Pathway patterns
    this.patterns.set('pathway', /\b(?:glycolysis|TCA cycle|Krebs cycle|citric acid cycle|pentose phosphate|beta-?oxidation|fatty acid (?:synthesis|oxidation)|amino acid metabolism|nucleotide metabolism|urea cycle|gluconeogenesis|glycogenolysis|glycogenesis|oxidative phosphorylation|electron transport chain|cellular respiration|apoptosis|autophagy|cell cycle|DNA repair|signaling pathway|signal transduction)\b/gi)

    // Disease patterns - enhanced for clinical use
    this.patterns.set('disease', /\b(?:diabetes(?:\s+mellitus)?(?:\s+type\s+[12])?|cancer|carcinoma|sarcoma|leukemia|lymphoma|melanoma|glioma|adenoma|alzheimer(?:'s)?(?:\s+disease)?|parkinson(?:'s)?(?:\s+disease)?|huntington(?:'s)?(?:\s+disease)?|hypertension|atherosclerosis|obesity|arthritis|rheumatoid arthritis|osteoarthritis|asthma|COPD|cystic fibrosis|muscular dystrophy|multiple sclerosis|lupus|psoriasis|eczema|hepatitis|cirrhosis|fibrosis|nephropathy|neuropathy|retinopathy|stroke|infarction|thrombosis|anemia|hemophilia)\b/gi)

    // Drug patterns - enhanced
    this.patterns.set('drug', /\b(?:aspirin|ibuprofen|acetaminophen|paracetamol|metformin|insulin|warfarin|heparin|digoxin|amoxicillin|azithromycin|ciprofloxacin|doxycycline|penicillin|prednisone|hydrocortisone|dexamethasone|albuterol|salbutamol|lisinopril|enalapril|atorvastatin|simvastatin|rosuvastatin|omeprazole|pantoprazole|famotidine|ranitidine|methotrexate|cyclophosphamide|doxorubicin|cisplatin|carboplatin|rituximab|trastuzumab|bevacizumab|pembrolizumab|nivolumab)\b/gi)
  }

  /**
   * Extract entities from a chunk of text
   */
  async extractFromChunk(chunk: Chunk): Promise<ExtractedEntities> {
    const entities: Entity[] = []
    const relations: Array<{ source: string; target: string; type: string; confidence: number }> = []
    let meshNormalized = 0

    // Extract entities using patterns
    for (const [type, pattern] of this.patterns) {
      const matches = chunk.content.matchAll(pattern)
      for (const match of matches) {
        const entityName = match[0]
        const existingEntity = entities.find(e =>
          e.name.toLowerCase() === entityName.toLowerCase()
        )

        if (existingEntity) {
          existingEntity.mentions++
          existingEntity.evidence.push(chunk.id)
        } else {
          const entity: Entity = {
            id: `${type}_${entityName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
            name: entityName,
            type: type as Entity['type'],
            confidence: 0.7,
            evidence: [chunk.id],
            mentions: 1,
            source: chunk.metadata.source,
            position: chunk.metadata.position
          }

          // Try MeSH normalization for diseases and drugs
          if (this.useMeSH && (type === 'disease' || type === 'drug')) {
            try {
              const meshResult = await searchMeSH(entityName)
              if (meshResult.found && meshResult.descriptor) {
                entity.normalizedName = meshResult.descriptor.descriptorName
                entity.meshId = meshResult.descriptor.descriptorUI
                entity.meshCategory = meshResult.descriptor.category
                entity.confidence = Math.min(1.0, entity.confidence + 0.2)
                meshNormalized++
              }
            } catch (error) {
              // MeSH lookup failed, continue with regex result
              logger.warn('EntityExtractor', 'MeSH lookup failed', { entityName, error })
            }
          }

          entities.push(entity)
        }
      }
    }

    // Extract relations based on co-occurrence
    relations.push(...this.extractRelations(entities, chunk))

    // Calculate statistics
    const byType: Record<string, number> = {}
    for (const entity of entities) {
      byType[entity.type] = (byType[entity.type] || 0) + 1
    }

    return {
      entities,
      relations,
      statistics: {
        totalEntities: entities.length,
        byType,
        totalRelations: relations.length,
        meshNormalized
      }
    }
  }

  /**
   * Extract entities from multiple chunks
   */
  async extractFromChunks(chunks: Chunk[]): Promise<ExtractedEntities> {
    const allEntities: Entity[] = []
    const allRelations: Array<{ source: string; target: string; type: string; confidence: number }> = []
    let totalMeshNormalized = 0

    for (const chunk of chunks) {
      const result = await this.extractFromChunk(chunk)
      allEntities.push(...result.entities)
      allRelations.push(...result.relations)
      totalMeshNormalized += result.statistics.meshNormalized
    }

    // NEW: Use AI extraction for the first chunk (usually abstract/intro) if enabled
    if (this.useAI && chunks.length > 0) {
      try {
        // Use AI for the first 1-2 chunks to capture context-dependent entities
        const textForAI = chunks.slice(0, 2).map(c => c.content).join('\n\n')
        const aiEntities = await this.extractWithAI(textForAI, chunks[0])
        allEntities.push(...aiEntities)
        logger.info('EntityExtractor', `Extracted ${aiEntities.length} entities using AI`)
      } catch (error) {
        logger.error('EntityExtractor', 'AI extraction failed', { error })
      }
    }

    // Merge duplicate entities
    const mergedEntities = this.mergeEntities(allEntities)

    // Calculate statistics
    const byType: Record<string, number> = {}
    for (const entity of mergedEntities) {
      byType[entity.type] = (byType[entity.type] || 0) + 1
    }

    return {
      entities: mergedEntities,
      relations: allRelations,
      statistics: {
        totalEntities: mergedEntities.length,
        byType,
        totalRelations: allRelations.length,
        meshNormalized: totalMeshNormalized
      }
    }
  }

  /**
   * Extract relations between entities based on co-occurrence
   */
  private extractRelations(
    entities: Entity[],
    chunk: Chunk
  ): Array<{ source: string; target: string; type: string; confidence: number }> {
    const relations: Array<{ source: string; target: string; type: string; confidence: number }> = []

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i]
        const entity2 = entities[j]

        // Determine relation type based on entity types
        let relationType = 'associated_with'
        if (entity1.type === 'protein' && entity2.type === 'gene') {
          relationType = 'encodes'
        } else if (entity1.type === 'gene' && entity2.type === 'protein') {
          relationType = 'encoded_by'
        } else if (entity1.type === 'drug' && entity2.type === 'disease') {
          relationType = 'treats'
        } else if (entity1.type === 'disease' && entity2.type === 'drug') {
          relationType = 'treated_by'
        } else if (entity1.type === 'protein' && entity2.type === 'metabolite') {
          relationType = 'interacts_with'
        } else if (entity1.type === 'metabolite' && entity2.type === 'protein') {
          relationType = 'interacts_with'
        } else if (entity1.type === 'protein' && entity2.type === 'pathway') {
          relationType = 'participates_in'
        } else if (entity1.type === 'gene' && entity2.type === 'disease') {
          relationType = 'associated_with'
        }

        relations.push({
          source: entity1.id,
          target: entity2.id,
          type: relationType,
          confidence: 0.5
        })
      }
    }

    return relations
  }

  /**
   * Merge duplicate entities based on name
   */
  private mergeEntities(entities: Entity[]): Entity[] {
    const merged: Map<string, Entity> = new Map()

    for (const entity of entities) {
      // Use normalized name if available
      const key = (entity.normalizedName || entity.name).toLowerCase()
      const existing = merged.get(key)

      if (existing) {
        existing.mentions += entity.mentions
        existing.confidence = Math.max(existing.confidence, entity.confidence)
        existing.evidence.push(...entity.evidence)
        existing.evidence = [...new Set(existing.evidence)]
        // Keep MeSH info if found
        if (entity.meshId && !existing.meshId) {
          existing.meshId = entity.meshId
          existing.normalizedName = entity.normalizedName
          existing.meshCategory = entity.meshCategory
        }
      } else {
        merged.set(key, { ...entity })
      }
    }

    return Array.from(merged.values())
  }

  /**
   * Enable/disable MeSH integration
   */
  setUseMeSH(enabled: boolean): void {
    this.useMeSH = enabled
    logger.info('EntityExtractor', `MeSH integration ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Get entities by type
   */
  getEntitiesByType(entities: Entity[], type: Entity['type']): Entity[] {
    return entities.filter(e => e.type === type)
  }

  /**
   * Get high confidence entities
   */
  getHighConfidenceEntities(entities: Entity[], threshold: number = 0.8): Entity[] {
    return entities.filter(e => e.confidence >= threshold)
  }

  /**
   * Extract entities using AI service
   */
  async extractWithAI(text: string, sourceChunk: Chunk): Promise<Entity[]> {
    const aiResults = await extractEntitiesWithAI(text)

    return aiResults.map(res => ({
      id: `${res.type}_${res.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_ai_${Date.now()}`,
      name: res.name,
      type: res.type as Entity['type'],
      confidence: res.confidence,
      evidence: [sourceChunk.id],
      mentions: 1,
      source: 'AI_Extraction',
      position: 0
    }))
  }

  getFrequentEntities(entities: Entity[], minMentions: number = 3): Entity[] {
    return entities.filter(e => e.mentions >= minMentions)
  }
}
