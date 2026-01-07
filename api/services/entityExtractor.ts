import { Chunk } from './chunkingEngine'

export interface Entity {
  id: string
  name: string
  type: 'protein' | 'gene' | 'metabolite' | 'pathway' | 'complex' | 'disease' | 'drug'
  confidence: number
  evidence: string[]
  mentions: number
  source: string
  position: number
}

export interface ExtractedEntities {
  entities: Entity[]
  relations: Array<{ source: string; target: string; type: string; confidence: number }>
  statistics: {
    totalEntities: number
    byType: Record<string, number>
    totalRelations: number
  }
}

export class EntityExtractor {
  private patterns: Map<string, RegExp>

  constructor() {
    this.patterns = new Map()
    this.initializePatterns()
  }

  private initializePatterns(): void {
    // Protein patterns (UniProt/Ensembl style names)
    this.patterns.set('protein', /[A-Z]{3}[a-z0-9]{2,4}/gi)
    
    // Gene patterns (HGNC/Ensembl style)
    this.patterns.set('gene', /[A-Z]{2,3}[0-9]{1,4}/gi)
    
    // Metabolite patterns (ChEBI/KEGG style)
    this.patterns.set('metabolite', /[A-Z]{2,4}[0-9]{2,4}/gi)
    
    // Pathway patterns
    this.patterns.set('pathway', /(?:glycolysis|TCA cycle|pentose phosphate|beta-oxidation|fatty acid synthesis|amino acid metabolism|nucleotide metabolism|urea cycle|gluconeogenesis|glycogenolysis|glycogenesis|oxidative phosphorylation|electron transport chain|photosynthesis|calvin cycle|cellular respiration)/gi)
    
    // Disease patterns
    this.patterns.set('disease', /(?:diabetes|cancer|alzheimer|parkinson|hypertension|atherosclerosis|obesity|arthritis|asthma|copd|cystic fibrosis|muscular dystrophy|multiple sclerosis|lupus|leukemia|lymphoma|melanoma|carcinoma|sarcoma|myeloma)/gi)
    
    // Drug patterns
    this.patterns.set('drug', /(?:aspirin|ibuprofen|acetaminophen|metformin|insulin|warfarin|heparin|digoxin|amoxicillin|azithromycin|ciprofloxacin|doxycycline|prednisone|hydrocortisone|albuterol|lisinopril|atorvastatin|simvastatin|omeprazole|famotidine)/gi)
  }

  /**
   * Extract entities from a chunk of text
   */
  async extractFromChunk(chunk: Chunk): Promise<ExtractedEntities> {
    const entities: Entity[] = []
    const relations: Array<{ source: string; target: string; type: string; confidence: number }> = []
    
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
          entities.push({
            id: `${type}_${entityName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
            name: entityName,
            type: type as Entity['type'],
            confidence: 0.7, // Base confidence from pattern matching
            evidence: [chunk.id],
            mentions: 1,
            source: chunk.metadata.source,
            position: chunk.metadata.position
          })
        }
      }
    }
    
    // Extract relations based on co-occurrence in same chunk
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
        totalRelations: relations.length
      }
    }
  }

  /**
   * Extract entities from multiple chunks
   */
  async extractFromChunks(chunks: Chunk[]): Promise<ExtractedEntities> {
    const allEntities: Entity[] = []
    const allRelations: Array<{ source: string; target: string; type: string; confidence: number }> = []
    
    for (const chunk of chunks) {
      const result = await this.extractFromChunk(chunk)
      allEntities.push(...result.entities)
      allRelations.push(...result.relations)
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
        totalRelations: allRelations.length
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
    
    // Simple co-occurrence based relation extraction
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
        }
        
        relations.push({
          source: entity1.id,
          target: entity2.id,
          type: relationType,
          confidence: 0.5 // Base confidence for co-occurrence
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
      const key = entity.name.toLowerCase()
      const existing = merged.get(key)
      
      if (existing) {
        existing.mentions += entity.mentions
        existing.confidence = Math.max(existing.confidence, entity.confidence)
        existing.evidence.push(...entity.evidence)
        existing.evidence = [...new Set(existing.evidence)] // Remove duplicates
      } else {
        merged.set(key, entity)
      }
    }
    
    return Array.from(merged.values())
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
   * Get frequently mentioned entities
   */
  getFrequentEntities(entities: Entity[], minMentions: number = 3): Entity[] {
    return entities.filter(e => e.mentions >= minMentions)
  }
}
