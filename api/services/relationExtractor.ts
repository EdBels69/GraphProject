import { Entity } from './entityExtractor'
import { RelationType, EvidenceType } from '../../shared/types'

export interface Relation {
  id: string
  source: string
  target: string
  type: RelationType | string  // Allow both typed and custom relations
  evidenceType: EvidenceType   // NEW: How was this discovered?
  confidence: number
  evidence: string[]
  sourceText: string
}

export interface ExtractedRelations {
  relations: Relation[]
  statistics: {
    totalRelations: number
    byType: Record<string, number>
    avgConfidence: number
  }
}

export class RelationExtractor {
  private relationPatterns: Map<string, RegExp>
  private verbPatterns: Map<string, RegExp>

  constructor() {
    this.relationPatterns = new Map()
    this.verbPatterns = new Map()
    this.initializePatterns()
  }

  private initializePatterns(): void {
    // Interaction patterns
    this.relationPatterns.set('interacts_with', /(?:interacts?|binds?|associates? with|complexes? with)/gi)
    this.relationPatterns.set('inhibits', /(?:inhibits?|suppresses?|blocks?|prevents?)/gi)
    this.relationPatterns.set('activates', /(?:activates?|stimulates?|induces?|promotes?|enhances?)/gi)
    this.relationPatterns.set('regulates', /(?:regulates?|controls?|modulates?|governs?)/gi)
    this.relationPatterns.set('phosphorylates', /(?:phosphorylates?)/gi)
    this.relationPatterns.set('acetylates', /(?:acetylates?)/gi)
    this.relationPatterns.set('methylates', /(?:methylates?)/gi)
    this.relationPatterns.set('ubiquitinates', /(?:ubiquitinates?)/gi)
    this.relationPatterns.set('degrades', /(?:degrades?|breaks? down|cleaves?)/gi)
    this.relationPatterns.set('transports', /(?:transports?|carries?|moves?)/gi)
    this.relationPatterns.set('produces', /(?:produces?|generates?|synthesizes?|creates?)/gi)
    this.relationPatterns.set('consumes', /(?:consumes?|uses?|utilizes?)/gi)
    this.relationPatterns.set('converts', /(?:converts?|transforms?|changes?)/gi)

    // Drug-disease patterns
    this.relationPatterns.set('treats', /(?:treats?|cures?|heals?|remedies?)/gi)
    this.relationPatterns.set('prevents', /(?:prevents?|avoids?|stops?)/gi)
    this.relationPatterns.set('causes', /(?:causes?|induces?|triggers?|leads to)/gi)
    this.relationPatterns.set('exacerbates', /(?:exacerbates?|worsens?|aggravates?)/gi)

    // Gene-protein patterns
    this.relationPatterns.set('encodes', /(?:encodes?|codes? for|translates to)/gi)
    this.relationPatterns.set('transcribed_to', /(?:transcribed to|transcribed into)/gi)
    this.relationPatterns.set('translated_to', /(?:translated to|translated into)/gi)

    // Pathway patterns
    this.relationPatterns.set('participates_in', /(?:participates? in|involved in|part of)/gi)
    this.relationPatterns.set('regulates_pathway', /(?:regulates? pathway|controls? pathway)/gi)
  }

  /**
   * Extract relations from text with given entities
   */
  async extractRelations(
    text: string,
    entities: Entity[],
    source: string
  ): Promise<ExtractedRelations> {
    const relations: Relation[] = []

    // Extract relations based on patterns
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i]
        const entity2 = entities[j]

        // Find relations between these entities in the text
        const entityRelations = this.findRelationsBetweenEntities(
          text,
          entity1,
          entity2,
          source
        )
        relations.push(...entityRelations)
      }
    }

    // Calculate statistics
    const byType: Record<string, number> = {}
    let totalConfidence = 0
    for (const relation of relations) {
      byType[relation.type] = (byType[relation.type] || 0) + 1
      totalConfidence += relation.confidence
    }

    return {
      relations,
      statistics: {
        totalRelations: relations.length,
        byType,
        avgConfidence: relations.length > 0 ? totalConfidence / relations.length : 0
      }
    }
  }

  /**
   * Find relations between two specific entities in text
   */
  private findRelationsBetweenEntities(
    text: string,
    entity1: Entity,
    entity2: Entity,
    source: string
  ): Relation[] {
    const relations: Relation[] = []

    // Check each relation pattern
    for (const [relationType, pattern] of this.relationPatterns) {
      // Look for pattern between entities
      const regex1 = new RegExp(
        `${entity1.name}[^.]*?${pattern.source}[^.]*?${entity2.name}`,
        'gi'
      )
      const regex2 = new RegExp(
        `${entity2.name}[^.]*?${pattern.source}[^.]*?${entity1.name}`,
        'gi'
      )

      const matches1 = text.match(regex1)
      const matches2 = text.match(regex2)

      if (matches1) {
        for (const match of matches1) {
          relations.push({
            id: `${entity1.id}_${entity2.id}_${relationType}_${Date.now()}`,
            source: entity1.id,
            target: entity2.id,
            type: relationType as RelationType,
            evidenceType: 'text_mining',
            confidence: 0.7,
            evidence: [source],
            sourceText: match
          })
        }
      }

      if (matches2) {
        for (const match of matches2) {
          const reversedType = this.reverseRelation(relationType)
          relations.push({
            id: `${entity2.id}_${entity1.id}_${reversedType}_${Date.now()}`,
            source: entity2.id,
            target: entity1.id,
            type: reversedType,
            evidenceType: 'text_mining',
            confidence: 0.7,
            evidence: [source],
            sourceText: match
          })
        }
      }
    }

    // Also check for co-occurrence within same sentence as weak relation
    const cooccurrenceRelations = this.findCooccurrenceRelations(
      text,
      entity1,
      entity2,
      source
    )
    relations.push(...cooccurrenceRelations)

    return relations
  }

  /**
   * Find co-occurrence relations (entities in same sentence)
   */
  private findCooccurrenceRelations(
    text: string,
    entity1: Entity,
    entity2: Entity,
    source: string
  ): Relation[] {
    const relations: Relation[] = []
    const sentences = text.split(/[.!?]+/)

    for (const sentence of sentences) {
      const hasEntity1 = sentence.toLowerCase().includes(entity1.name.toLowerCase())
      const hasEntity2 = sentence.toLowerCase().includes(entity2.name.toLowerCase())

      if (hasEntity1 && hasEntity2) {
        relations.push({
          id: `${entity1.id}_${entity2.id}_cooccurs_${Date.now()}`,
          source: entity1.id,
          target: entity2.id,
          type: 'cooccurs_with',
          evidenceType: 'cooccurrence',
          confidence: 0.4, // Increased slightly for visibility
          evidence: [source],
          sourceText: sentence.trim()
        })
      }
    }

    return relations
  }

  /**
   * Reverse relation type (e.g., activates -> activated_by)
   */
  private reverseRelation(relationType: string): string {
    const reversals: Record<string, string> = {
      'interacts_with': 'interacts_with',
      'inhibits': 'inhibited_by',
      'activates': 'activated_by',
      'regulates': 'regulated_by',
      'phosphorylates': 'phosphorylated_by',
      'acetylates': 'acetylated_by',
      'methylates': 'methylated_by',
      'ubiquitinates': 'ubiquitinated_by',
      'degrades': 'degraded_by',
      'transports': 'transported_by',
      'produces': 'produced_by',
      'consumes': 'consumed_by',
      'converts': 'converted_by',
      'treats': 'treated_by',
      'prevents': 'prevented_by',
      'causes': 'caused_by',
      'exacerbates': 'exacerbated_by',
      'encodes': 'encoded_by',
      'participates_in': 'has_participant',
      'regulates_pathway': 'regulated_by_pathway'
    }

    return reversals[relationType] || `${relationType}_by`
  }

  /**
   * Merge duplicate relations
   */
  mergeRelations(relations: Relation[]): Relation[] {
    const merged: Map<string, Relation> = new Map()

    for (const relation of relations) {
      const key = `${relation.source}_${relation.target}_${relation.type}`
      const existing = merged.get(key)

      if (existing) {
        existing.confidence = Math.max(existing.confidence, relation.confidence)
        existing.evidence.push(...relation.evidence)
        existing.evidence = [...new Set(existing.evidence)]
      } else {
        merged.set(key, relation)
      }
    }

    return Array.from(merged.values())
  }

  /**
   * Filter relations by confidence threshold
   */
  filterByConfidence(relations: Relation[], threshold: number = 0.5): Relation[] {
    return relations.filter(r => r.confidence >= threshold)
  }

  /**
   * Get relations by type
   */
  getRelationsByType(relations: Relation[], type: string): Relation[] {
    return relations.filter(r => r.type === type)
  }

  /**
   * Get relations involving a specific entity
   */
  getRelationsForEntity(relations: Relation[], entityId: string): Relation[] {
    return relations.filter(r => r.source === entityId || r.target === entityId)
  }
}

export const relationExtractor = new RelationExtractor()
