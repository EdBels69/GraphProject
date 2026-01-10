import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let client: any

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === '') {
  console.warn('[Supabase] Credentials not found. Using MOCK client for Local Mode.')
  client = {
    auth: {
      signOut: async () => { },
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } })
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null }),
    })
  }
} else {
  client = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = client

export type Tables = {
  articles: {
    id: string
    title: string
    content: string
    url: string | null
    uploaded_at: string
    status: 'pending' | 'analyzing' | 'completed' | 'error'
    created_at: string
    updated_at: string
  }
  entities: {
    id: string
    name: string
    type: 'protein' | 'gene' | 'metabolite' | 'pathway' | 'complex'
    count: number
    articles: number[]
    created_at: string
    updated_at: string
  }
  interactions: {
    id: string
    source: string
    target: string
    type: 'activation' | 'inhibition' | 'phosphorylation' | 'binding'
    weight: number
    articles: number[]
    created_at: string
    updated_at: string
  }
  graph_nodes: {
    id: string
    name: string
    type: 'protein' | 'gene' | 'metabolite' | 'pathway'
    degree: number
    betweenness: number
    closeness: number
    eigenvector: number
    community: number
    x: number | null
    y: number | null
    created_at: string
    updated_at: string
  }
  graph_edges: {
    id: string
    source: string
    target: string
    type: 'activation' | 'inhibition' | 'phosphorylation' | 'binding'
    weight: number
    created_at: string
    updated_at: string
  }
  research_gaps: {
    id: string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    category: string
    related_entities: string[]
    evidence_score: number
    suggested_experiments: string[]
    publications: number
    created_at: string
    updated_at: string
  }
  links: {
    id: string
    article_id: string
    type: 'web' | 'literature'
    url: string
    title: string | null
    created_at: string
  }
  genes: {
    id: string
    name: string
    description: string | null
    function: string | null
    pathway: string[]
    diseases: string[]
    created_at: string
    updated_at: string
  }
  proteins: {
    id: string
    name: string
    description: string | null
    function: string | null
    pathway: string[]
    diseases: string[]
    created_at: string
    updated_at: string
  }
  biochemical_processes: {
    id: string
    name: string
    description: string | null
    pathway: string[]
    enzymes: string[]
    metabolites: string[]
    created_at: string
    updated_at: string
  }
  metabolites: {
    id: string
    name: string
    description: string | null
    chemical_formula: string | null
    pathway: string[]
    created_at: string
    updated_at: string
  }
  interaction_mechanisms: {
    id: string
    name: string
    description: string | null
    type: string
    examples: string[]
    created_at: string
    updated_at: string
  }
  hypotheses: {
    id: string
    title: string
    description: string
    evidence: string[]
    confidence: number
    status: 'proposed' | 'testing' | 'confirmed' | 'rejected'
    created_at: string
    updated_at: string
  }
  discovered_patterns: {
    id: string
    name: string
    description: string
    type: string
    entities: string[]
    confidence: number
    created_at: string
  }
  summaries: {
    id: string
    article_id: string
    level: 'brief' | 'detailed' | 'full'
    content: string
    key_points: string[]
    created_at: string
    updated_at: string
  }
  analysis_metadata: {
    id: string
    analysis_id: string
    model_version: string
    parameters: Record<string, any>
    started_at: string
    completed_at: string | null
    status: 'running' | 'completed' | 'failed'
    created_at: string
    updated_at: string
  }
}
