# System Architecture

## Overview

GraphProject is a modular application designed for scientific literature analysis. It uses a service-oriented architecture (SOA) within a monolithic codebase to ensure separation of concerns.

## Component Diagram

```mermaid
graph TD
    Client[Frontend (React)]
    
    subgraph API [Backend (Express)]
        RouteHandler[API Routes]
        
        subgraph Agents
            LitAgent[LiteratureAgent]
        end
        
        subgraph Services
            JM[JobManager]
            Search[SearchOrchestrator]
            Analyze[AnalysisService]
            Graph[GraphService]
            Socket[SocketService]
        end
        
        subgraph DataAccess
            JobRepo[JobRepository]
            ArtRepo[ArticleRepository]
            DB[(SQLite / Prisma)]
        end
    end

    Client -- HTTP/REST --> RouteHandler
    Client -- WebSocket --> Socket
    
    RouteHandler --> LitAgent
    
    LitAgent --> JM
    LitAgent --> Search
    LitAgent --> Analyze
    LitAgent --> Graph
    
    JM --> JobRepo
    JM --> Socket
    
    Search --> External[External APIs (PubMed/Crossref)]
    Analyze --> External
    
    JobRepo --> DB
    ArtRepo --> DB
```

## Core Services

### JobManager

Single source of truth for Research Jobs. Handles state transitions (`pending` -> `searching` -> `completed`), persistence via `JobRepository`, and real-time updates via `SocketService`.

### AnalysisService

Orchestrates the heavy lifting:

1. **PDF Discovery**: Uses Unpaywall to find free PDFs.
2. **Download**: Fetches content with retry logic.
3. **Extraction**: Uses NLP to extract Entities and Relations.

### SearchOrchestrator

Aggregates results from multiple sources (PubMed, Crossref, ArXiv), handles deduplication, and scores relevance.
