import { create } from 'zustand'

interface Article {
  id: string
  title: string
  authors: string[]
  year: number
  journal?: string
  doi?: string
  pmid?: string
  abstract?: string
  keywords?: string[]
  url?: string
}

interface Entity {
  id: string
  name: string
  type: string
  mentions: number
  confidence: number
}

interface Interaction {
  id: string
  source: string
  target: string
  type: string
  strength: number
  evidence: string[]
}

interface GraphNode {
  id: string
  label: string
  group: string
  attributes: Record<string, any>
}

interface GraphEdge {
  id: string
  source: string
  target: string
  weight: number
  type: string
  attributes?: Record<string, any>
}

interface AppState {
  articles: Article[]
  entities: Entity[]
  interactions: Interaction[]
  graph: {
    nodes: GraphNode[]
    edges: GraphEdge[]
  } | null
  patterns: Array<{
    id: string
    name: string
    description: string
    nodes: string[]
    type: 'cluster' | 'trend' | 'gap'
  }>
  statistics: Record<string, any> | null
  loading: boolean
  error: string | null

  setArticles: (articles: Article[]) => void
  addArticle: (article: Article) => void
  updateArticle: (id: string, article: Partial<Article>) => void
  removeArticle: (id: string) => void
  clearArticles: () => void

  setEntities: (entities: Entity[]) => void
  addEntity: (entity: Entity) => void
  clearEntities: () => void

  setInteractions: (interactions: Interaction[]) => void
  addInteraction: (interaction: Interaction) => void
  clearInteractions: () => void

  setGraph: (graph: { nodes: GraphNode[]; edges: GraphEdge[] } | null) => void
  clearGraph: () => void

  setPatterns: (patterns: AppState['patterns']) => void
  clearPatterns: () => void

  setStatistics: (statistics: Record<string, any> | null) => void
  clearStatistics: () => void

  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void

  reset: () => void
}

const initialState = {
  articles: [],
  entities: [],
  interactions: [],
  graph: null,
  patterns: [],
  statistics: null,
  loading: false,
  error: null
}

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setArticles: (articles) => set({ articles }),
  addArticle: (article) => set((state) => ({ articles: [...state.articles, article] })),
  updateArticle: (id, article) =>
    set((state) => ({
      articles: state.articles.map((a) => (a.id === id ? { ...a, ...article } : a))
    })),
  removeArticle: (id) =>
    set((state) => ({ articles: state.articles.filter((a) => a.id !== id) })),
  clearArticles: () => set({ articles: [] }),

  setEntities: (entities) => set({ entities }),
  addEntity: (entity) => set((state) => ({ entities: [...state.entities, entity] })),
  clearEntities: () => set({ entities: [] }),

  setInteractions: (interactions) => set({ interactions }),
  addInteraction: (interaction) =>
    set((state) => ({ interactions: [...state.interactions, interaction] })),
  clearInteractions: () => set({ interactions: [] }),

  setGraph: (graph) => set({ graph }),
  clearGraph: () => set({ graph: null }),

  setPatterns: (patterns) => set({ patterns }),
  clearPatterns: () => set({ patterns: [] }),

  setStatistics: (statistics) => set({ statistics }),
  clearStatistics: () => set({ statistics: null }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  reset: () => set(initialState)
}))
