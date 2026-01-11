/**
 * Centralized API endpoints for the Graph Analyser application.
 * All paths are relative to the API base URL.
 */
export const API_ENDPOINTS = {
    GRAPHS: {
        BASE: '/graphs',
        BY_ID: (id: string) => `/graphs/${id}`,
        UPLOAD: '/graphs/upload',
        NODES: (id: string) => `/graphs/${id}/nodes`,
        NODE_BY_ID: (graphId: string, nodeId: string) => `/graphs/${graphId}/nodes/${nodeId}`,
        EDGES: (id: string) => `/graphs/${id}/edges`,
        EDGE_BY_ID: (graphId: string, edgeId: string) => `/graphs/${graphId}/edges/${edgeId}`,
        RESEARCH: (id: string) => `/graphs/${id}/research`,
        EXPORT_GEXF: (id: string) => `/graphs/${id}/export/gexf`,
        EXPORT_PDF: (id: string) => `/graphs/${id}/export/pdf`,
    },
    ANALYSIS: {
        METRICS: (id: string) => `/analysis/${id}/metrics`,
        CENTRALITY: (id: string) => `/analysis/${id}/centrality`,
        COMMUNITIES: (id: string) => `/analysis/${id}/communities`,
        GAPS: (id: string) => `/analysis/${id}/gaps`,
        STATISTICS: (id: string) => `/graphs/${id}/statistics`, // Legacy from GraphController
        SHORTEST_PATH: (id: string) => `/graphs/${id}/shortest-path`,
    },
    ARTICLES: {
        BASE: '/articles',
        BY_ID: (id: string) => `/articles/${id}`,
    },
    RESEARCH: {
        BASE: '/research',
        JOBS_LIST: '/research/jobs',
        JOBS: (id: string) => `/research/jobs/${id}`,
        CONFIG: (id: string) => `/research/${id}/config`,
        PAPERS: (id: string) => `/research/jobs/${id}/papers`,
        SCREENING: (id: string) => `/research/jobs/${id}/screening`,
    },
    AI: {
        BASE: '/ai',
        CHAT: '/ai/chat',
        ANALYZE: '/ai/analyze',
        ASK_GRAPH: '/ai/ask-graph',
    },
    SEARCH: {
        BASE: '/search',
    },
    SYSTEM: {
        HEALTH: '/health',
        CONFIG: '/config',
        STATS: '/statistics',
    }
}
