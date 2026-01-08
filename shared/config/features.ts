/**
 * Feature Flags - Control feature availability
 * 
 * USAGE:
 * - Set to false to use legacy implementation
 * - Set to true to enable new feature
 * - Gradually roll out features without breaking changes
 */

export interface FeatureFlags {
    // ==========================================================================
    // ENTITY EXTRACTION
    // ==========================================================================

    /** Use UMLS ontology for entity normalization */
    USE_UMLS_ONTOLOGY: boolean

    /** Use BioBERT/scispaCy for NER instead of regex */
    USE_ML_NER: boolean

    /** Enable MeSH term lookup */
    USE_MESH_LOOKUP: boolean

    /** Enable Gene Ontology integration */
    USE_GENE_ONTOLOGY: boolean

    // ==========================================================================
    // STORAGE
    // ==========================================================================

    /** Use Parquet format for graph storage */
    USE_PARQUET_STORAGE: boolean

    /** Enable graph caching */
    USE_GRAPH_CACHE: boolean

    /** Use SQLite for persistent storage */
    USE_SQLITE_STORAGE: boolean

    // ==========================================================================
    // ANALYSIS
    // ==========================================================================

    /** Enable community detection */
    USE_COMMUNITY_DETECTION: boolean

    /** Enable research gap detection */
    USE_GAP_DETECTION: boolean

    /** Use advanced centrality metrics */
    USE_ADVANCED_CENTRALITY: boolean

    // ==========================================================================
    // AI INTEGRATION
    // ==========================================================================

    /** Enable AI-powered entity extraction */
    USE_AI_EXTRACTION: boolean

    /** Enable AI-powered gap suggestions */
    USE_AI_GAP_SUGGESTIONS: boolean

    /** MiMo API integration */
    USE_MIMO_API: boolean

    /** Enable AI features globally */
    USE_AI_FEATURES: boolean
}

/**
 * Current feature configuration
 * Modify these values to enable/disable features
 */
export const FEATURES: FeatureFlags = {
    // Entity extraction - currently using regex, ML features disabled
    USE_UMLS_ONTOLOGY: false,
    USE_ML_NER: false,
    USE_MESH_LOOKUP: false,
    USE_GENE_ONTOLOGY: false,

    // Storage - basic features enabled
    USE_PARQUET_STORAGE: false,
    USE_GRAPH_CACHE: true,
    USE_SQLITE_STORAGE: false,

    // Analysis - basic features enabled
    USE_COMMUNITY_DETECTION: true,
    USE_GAP_DETECTION: true,
    USE_ADVANCED_CENTRALITY: false,

    // AI - enabled with DeepSeek
    USE_AI_EXTRACTION: true,
    USE_AI_GAP_SUGGESTIONS: true,
    USE_MIMO_API: false,
    USE_AI_FEATURES: true,
}

/**
 * Get feature flag value
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return FEATURES[feature]
}

/**
 * Override features at runtime (for testing)
 */
export function setFeature(feature: keyof FeatureFlags, value: boolean): void {
    FEATURES[feature] = value
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): (keyof FeatureFlags)[] {
    return (Object.keys(FEATURES) as (keyof FeatureFlags)[])
        .filter(key => FEATURES[key])
}
