/**
 * Entity Contracts - Core domain entities for Graph Analyser
 * @version 2.0
 * 
 * RULE: Only extend, never remove or change existing types
 */

// =============================================================================
// ENTITY TYPES - Biomedical domain
// =============================================================================

/**
 * All supported entity types
 * When adding new types, add to the END of the union
 */
export type EntityType =
    // v1.0 - Core types
    | 'protein'
    | 'gene'
    | 'metabolite'
    | 'pathway'
    | 'disease'
    | 'drug'
    // v1.1 - Extended biological
    | 'complex'
    | 'cell_type'
    | 'organism'
    | 'tissue'
    // v2.0 - Clinical
    | 'symptom'
    | 'treatment'
    | 'biomarker'
    | 'clinical_trial'

/**
 * Entity type metadata for UI and validation
 */
export const ENTITY_TYPE_META: Record<EntityType, {
    label: string
    color: string
    icon: string
    ontologies: string[]
    addedInVersion: string
}> = {
    protein: { label: 'Protein', color: '#3B82F6', icon: 'dna', ontologies: ['UniProt', 'PDB'], addedInVersion: '1.0' },
    gene: { label: 'Gene', color: '#10B981', icon: 'code', ontologies: ['HGNC', 'Ensembl', 'NCBI Gene'], addedInVersion: '1.0' },
    metabolite: { label: 'Metabolite', color: '#F59E0B', icon: 'flask', ontologies: ['ChEBI', 'KEGG', 'HMDB'], addedInVersion: '1.0' },
    pathway: { label: 'Pathway', color: '#8B5CF6', icon: 'git-branch', ontologies: ['KEGG', 'Reactome', 'WikiPathways'], addedInVersion: '1.0' },
    disease: { label: 'Disease', color: '#EF4444', icon: 'heart-pulse', ontologies: ['MeSH', 'ICD-10', 'OMIM', 'DOID'], addedInVersion: '1.0' },
    drug: { label: 'Drug', color: '#EC4899', icon: 'pill', ontologies: ['DrugBank', 'ChEMBL', 'RxNorm'], addedInVersion: '1.0' },
    complex: { label: 'Complex', color: '#6366F1', icon: 'layers', ontologies: ['Complex Portal'], addedInVersion: '1.1' },
    cell_type: { label: 'Cell Type', color: '#14B8A6', icon: 'circle', ontologies: ['Cell Ontology', 'CL'], addedInVersion: '1.1' },
    organism: { label: 'Organism', color: '#84CC16', icon: 'tree', ontologies: ['NCBI Taxonomy'], addedInVersion: '1.1' },
    tissue: { label: 'Tissue', color: '#F97316', icon: 'box', ontologies: ['UBERON', 'BTO'], addedInVersion: '1.1' },
    symptom: { label: 'Symptom', color: '#DC2626', icon: 'thermometer', ontologies: ['SYMP', 'HPO'], addedInVersion: '2.0' },
    treatment: { label: 'Treatment', color: '#7C3AED', icon: 'stethoscope', ontologies: ['NCI Thesaurus'], addedInVersion: '2.0' },
    biomarker: { label: 'Biomarker', color: '#0891B2', icon: 'activity', ontologies: ['LOINC'], addedInVersion: '2.0' },
    clinical_trial: { label: 'Clinical Trial', color: '#4F46E5', icon: 'clipboard', ontologies: ['ClinicalTrials.gov'], addedInVersion: '2.0' },
}

// =============================================================================
// ENTITY INTERFACE
// =============================================================================

/**
 * Core entity structure - the main contract
 */
export interface Entity {
    /** Unique identifier */
    id: string

    /** Display name */
    name: string

    /** Entity type from controlled vocabulary */
    type: EntityType

    /** Confidence score 0-1 */
    confidence: number

    /** Source document/chunk IDs where found */
    evidence: string[]

    /** Number of mentions across all sources */
    mentions: number

    /** Original source identifier */
    source: string

    /** Position in source (for highlighting) */
    position: number

    /**
     * External database identifiers
     * Key: ontology name, Value: ID in that ontology
     */
    externalIds?: Record<string, string>

    /**
     * Extensible metadata - for future additions without breaking changes
     */
    metadata?: Record<string, unknown>
}

// =============================================================================
// RELATION TYPES
// =============================================================================

export type RelationType =
    // Core relations
    | 'associated_with'
    | 'interacts_with'
    // Gene-Protein
    | 'encodes'
    | 'encoded_by'
    // Drug-Disease
    | 'treats'
    | 'treated_by'
    | 'causes'
    | 'caused_by'
    // Pathway
    | 'part_of'
    | 'regulates'
    | 'regulated_by'
    | 'activates'
    | 'inhibits'
    // Clinical
    | 'indicates'   // biomarker indicates disease
    | 'contraindicates'

export interface Relation {
    id: string
    source: string  // Entity ID
    target: string  // Entity ID
    type: RelationType
    confidence: number
    evidence: string[]
    metadata?: Record<string, unknown>
}

// =============================================================================
// EXTRACTION RESULT
// =============================================================================

export interface ExtractionResult {
    /** Schema version for migration */
    version: '1.0' | '1.1' | '2.0'

    entities: Entity[]
    relations: Relation[]

    statistics: {
        totalEntities: number
        byType: Record<EntityType, number>
        totalRelations: number
        processingTimeMs: number
    }

    /** Source document info */
    source: {
        id: string
        type: 'pubmed' | 'word' | 'pdf' | 'text'
        title?: string
    }
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isValidEntityType(type: string): type is EntityType {
    return type in ENTITY_TYPE_META
}

export function isEntity(obj: unknown): obj is Entity {
    if (typeof obj !== 'object' || obj === null) return false
    const e = obj as Record<string, unknown>
    return (
        typeof e.id === 'string' &&
        typeof e.name === 'string' &&
        typeof e.type === 'string' &&
        isValidEntityType(e.type) &&
        typeof e.confidence === 'number'
    )
}
