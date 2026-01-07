# Phases 3-5 Implementation Plan

## Phase 3: Advanced Features - Graph Algorithms

### 3.1 Graph Centrality Analysis
- **Service**: `api/services/graphCentrality.ts`
- **Algorithms**:
  - Degree Centrality: Number of connections per node
  - Betweenness Centrality: Nodes on shortest paths
  - Closeness Centrality: Average distance to all other nodes
  - Eigenvector Centrality: Influence based on neighbor connections
  - PageRank: Importance based on link structure

### 3.2 Community Detection
- **Service**: `api/services/communityDetection.ts`
- **Algorithms**:
  - Louvain Modularity: Community detection based on modularity optimization
  - Label Propagation: Fast community detection
  - Girvan-Newman: Edge betweenness-based communities
  - Connected Components: Identify disconnected subgraphs

### 3.3 Path Analysis
- **Service**: `api/services/pathAnalysis.ts`
- **Algorithms**:
  - Shortest Path (Dijkstra/BFS): Minimum cost path between nodes
  - All Shortest Paths: All minimum cost paths
  - K-Shortest Paths: Top K shortest paths
  - Path Length Distribution: Statistics on path lengths
  - Cycle Detection: Find cycles in the graph

### 3.4 Research Gap Detection
- **Service**: `api/services/researchGapDetection.ts`
- **Types of Gaps**:
  - Structural Gaps: Missing connections between entities
  - Temporal Gaps: Gaps in knowledge over time
  - Content Gaps: Missing entity types or relations
  - Confidence Gaps: Low-confidence areas requiring validation

### 3.5 API Routes
- **File**: `api/routes/graphAnalysis.ts`
- **Endpoints**:
  - GET /api/analysis/centrality/:graphId
  - GET /api/analysis/communities/:graphId
  - GET /api/analysis/paths/:graphId
  - GET /api/analysis/gaps/:graphId
  - POST /api/analysis/shortest-path

---

## Phase 4: New Features - Global Search & Source Download

### 4.1 Global Search Service
- **Service**: `api/services/globalSearch.ts`
- **Sources**:
  - Google Scholar: Academic articles
  - PubMed: Biomedical literature
  - Crossref: DOI and citation metadata
  - arXiv: Preprint repository
- **Features**:
  - Query multiple sources simultaneously
  - Deduplicate results
  - Rank by relevance and citation count
  - Extract metadata (title, authors, year, abstract, DOI)

### 4.2 Source Download Service
- **Service**: `api/services/sourceDownload.ts`
- **Features**:
  - Batch PDF downloads
  - Progress tracking
  - Retry failed downloads
  - Rate limiting
  - Legal/ethical compliance checks

### 4.3 Citation Network Builder
- **Service**: `api/services/citationNetwork.ts`
- **Features**:
  - Extract citation references
  - Build citation graph
  - Calculate citation metrics
  - Identify highly cited papers

### 4.4 API Routes
- **File**: `api/routes/search.ts`
- **Endpoints**:
  - GET /api/search?q=query&source=scholar,pubmed
  - POST /api/search/advanced
  - POST /api/search/download
  - GET /api/search/download/status/:jobId
  - GET /api/search/citations/:doi

---

## Phase 5: Optimization - Performance & Caching

### 5.1 Caching Layer
- **Service**: `api/services/cacheManager.ts`
- **Features**:
  - In-memory cache (LRU)
  - Redis integration option
  - Cache invalidation strategies
  - Cache warming for frequently accessed data

### 5.2 Database Optimization
- **Service**: `api/services/databaseOptimizer.ts`
- **Features**:
  - Query optimization
  - Index creation
  - Connection pooling
  - Batch operations

### 5.3 Background Job Queue
- **Service**: `api/services/jobQueue.ts`
- **Features**:
  - Process long-running tasks asynchronously
  - Job status tracking
  - Retry logic
  - Priority queues

### 5.4 Performance Monitoring
- **Service**: `api/services/performanceMonitor.ts`
- **Features**:
  - Request/response timing
  - Memory usage tracking
  - Database query performance
  - Alerting for degraded performance

### 5.5 API Routes
- **File**: `api/routes/system.ts`
- **Endpoints**:
  - GET /api/system/health
  - GET /api/system/metrics
  - GET /api/system/cache/stats
  - POST /api/system/cache/clear
  - GET /api/system/jobs

---

## Implementation Order

### Priority 1 (Critical for Core Functionality)
1. Graph Centrality Analysis
2. Path Analysis
3. Research Gap Detection
4. Global Search Service
5. Caching Layer

### Priority 2 (Enhanced Features)
6. Community Detection
7. Citation Network Builder
8. Source Download Service
9. Database Optimization

### Priority 3 (Nice to Have)
10. Background Job Queue
11. Performance Monitoring

---

## Technology Requirements

### Additional Dependencies
```json
{
  "dependencies": {
    "redis": "^4.6.0",
    "bull": "^4.11.0",
    "cheerio": "^1.0.0-rc.12",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/cheerio": "^0.22.0"
  }
}
```

### External Services
- **Redis**: For caching and job queue (optional, can use in-memory)
- **Google Scholar**: Web scraping (respect robots.txt)
- **PubMed API**: E-utilities API
- **Crossref API**: Free API access

---

## Success Metrics

### Phase 3
- Centrality calculations complete within 5 seconds for graphs < 10K nodes
- Community detection identifies meaningful biological pathways
- Research gaps provide actionable insights

### Phase 4
- Global search returns results from 3+ sources within 10 seconds
- Batch downloads process 100+ PDFs reliably
- Citation networks accurately reflect paper relationships

### Phase 5
- Cache hit rate > 70% for repeated queries
- API response time < 200ms for cached data
- System handles 100+ concurrent requests
