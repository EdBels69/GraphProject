import { v4 as uuidv4 } from 'uuid';
import { DatabaseError } from './ErrorHandler';
import { Graph } from '../../shared/contracts/graph';

export interface Article {
  id: string;
  title: string;
  content: string;
  url?: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  uploadedAt: Date;
  updatedAt?: Date;
  userId?: string;
  metadata?: any;
}

export interface ArticleEdge {
  id: string;
  source: string;
  target: string;
  strength: number;
  type: 'citation' | 'reference' | 'collaboration';
  createdAt: Date;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  nodes: string[];
  type: 'cluster' | 'trend' | 'gap';
  createdAt: Date;
  metadata?: any;
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user' | 'guest';
  permissions: string[];
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface ResearchJobRecord {
  id: string;
  topic: string;
  mode: 'quick' | 'research';
  status: string;
  articlesFound: number;
  progress: number;
  queries?: string[];
  articlesProcessed?: number;
  startTime?: Date;
  endTime?: Date;
  graphId?: string;
  error?: string;
  articles?: any[]; // Serialized articles array or fetched relations
  createdAt: Date;
  updatedAt: Date;
  // New fields
  includedIds?: string[];
  excludedIds?: string[];
  exclusionReasons?: Record<string, string>;
  reviewText?: string;
  userId: string;
}

export interface DatabaseConfig {
  filePath: string;
  enableWAL: boolean;
  verbose: boolean;
}

import { PrismaClient } from './prisma'

export class DatabaseManager {
  private edges: Map<string, ArticleEdge> = new Map();
  private patterns: Map<string, Pattern> = new Map();
  private users: Map<string, User> = new Map();
  private prisma: PrismaClient;
  private isInitialized = false;

  constructor(config: Partial<DatabaseConfig> = {}) {
    const filePath = config.filePath || './dev.db';
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: filePath.includes(':memory:') ? 'file::memory:?cache=shared' : `file:${filePath}`
        }
      }
    } as any);
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    try {
      await this.prisma.$connect();
      this.isInitialized = true;
      console.log('[Database] Database connection established');
    } catch (error) {
      console.error('[Database] Failed to connect to database:', error);
      throw new DatabaseError('DB_INIT_ERROR', 'Failed to initialize database', { error });
    }
  }

  getClient() {
    return this.prisma;
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new DatabaseError('DB_NOT_INITIALIZED', 'Database not initialized');
    }
  }

  // Legacy Article methods removed/replaced by Job Articles persistence




  async createEdge(edge: Omit<ArticleEdge, 'id' | 'createdAt'>): Promise<ArticleEdge> {
    this.ensureInitialized();

    const id = uuidv4();
    const createdAt = new Date();

    const newEdge: ArticleEdge = {
      ...edge,
      id,
      createdAt
    };

    this.edges.set(id, newEdge);

    console.log(`[Database] Created edge ${id}`, { source: edge.source, target: edge.target });

    return newEdge;
  }

  async getEdges(articleId?: string): Promise<ArticleEdge[]> {
    this.ensureInitialized();

    let edges = Array.from(this.edges.values());

    if (articleId) {
      edges = edges.filter(e => e.source === articleId || e.target === articleId);
    }

    console.log(`[Database] Retrieved ${edges.length} edges`);

    return edges;
  }

  async createPattern(pattern: Omit<Pattern, 'id' | 'createdAt'>): Promise<Pattern> {
    this.ensureInitialized();

    const id = uuidv4();
    const createdAt = new Date();

    const newPattern: Pattern = {
      ...pattern,
      id,
      createdAt
    };

    this.patterns.set(id, newPattern);

    console.log(`[Database] Created pattern ${id}`, { name: pattern.name });

    return newPattern;
  }

  async getPatterns(): Promise<Pattern[]> {
    this.ensureInitialized();

    const patterns = Array.from(this.patterns.values());

    console.log(`[Database] Retrieved ${patterns.length} patterns`);

    return patterns;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    this.ensureInitialized();

    const id = uuidv4();
    const createdAt = new Date();

    const newUser: User = {
      ...user,
      id,
      createdAt
    };

    this.users.set(id, newUser);

    console.log(`[Database] Created user ${id}`, { username: user.username });

    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    this.ensureInitialized();

    const user = Array.from(this.users.values()).find(u => u.email === email);

    if (!user) {
      console.warn(`[Database] User ${email} not found`);
      return null;
    }

    return user;
  }

  async saveGraphToDb(graph: Graph): Promise<void> {
    this.ensureInitialized();

    try {
      // Prepare relational data
      const nodesData = graph.nodes.map((n: any) => ({
        graphId: graph.id,
        label: n.type || 'concept', // Store "type" in "label" column for querying convenience
        name: n.label || n.id,      // Store display label in "name"
        data: JSON.stringify(n)
      }));

      const edgesData = graph.edges.map((e: any) => ({
        graphId: graph.id,
        source: e.source,
        target: e.target,
        relation: e.relation || 'related_to',
        data: JSON.stringify(e)
      }));

      await this.prisma.$transaction([
        // 1. Maintain the "Header" and JSON blobs for legacy compatibility/fast full reads
        this.prisma.graph.upsert({
          where: { id: graph.id },
          update: {
            userId: (graph as any).userId || 'system',
            name: graph.name,
            description: graph.description,
            version: graph.version,
            directed: graph.directed,
            nodes: JSON.stringify(graph.nodes),
            edges: JSON.stringify(graph.edges),
            metrics: JSON.stringify(graph.metrics || {}),
            sources: JSON.stringify(graph.sources || []),
            metadata: JSON.stringify(graph.metadata || {}),
            updatedAt: new Date()
          },
          create: {
            id: graph.id,
            userId: (graph as any).userId || 'system',
            name: graph.name,
            description: graph.description,
            version: graph.version || '2.0',
            directed: graph.directed || false,
            nodes: JSON.stringify(graph.nodes),
            edges: JSON.stringify(graph.edges),
            metrics: JSON.stringify(graph.metrics || {}),
            sources: JSON.stringify(graph.sources || []),
            metadata: JSON.stringify(graph.metadata || {}),
            createdAt: new Date(graph.createdAt || Date.now()),
            updatedAt: new Date()
          }
        }),
        // 2. Clear old relational data to ensure clean state
        this.prisma.graphNode.deleteMany({ where: { graphId: graph.id } }),
        this.prisma.graphEdge.deleteMany({ where: { graphId: graph.id } }),
        // 3. Insert new relational data
        this.prisma.graphNode.createMany({ data: nodesData }),
        this.prisma.graphEdge.createMany({ data: edgesData })
      ]);

      console.log(`[Database] Saved graph ${graph.id} to SQLite (Relational: ${nodesData.length} nodes, ${edgesData.length} edges)`);
    } catch (error) {
      console.error(`[Database] Failed to save graph ${graph.id}:`, error);
    }
  }


  async getGraphFromDb(id: string, userId: string): Promise<Graph | null> {
    this.ensureInitialized();

    try {
      const graph = await this.prisma.graph.findUnique({
        where: { id, userId }
      } as any);

      if (!graph) return null;

      return {
        id: graph.id,
        name: graph.name,
        description: graph.description || undefined,
        version: graph.version as any,
        directed: graph.directed,
        nodes: JSON.parse(graph.nodes),
        edges: JSON.parse(graph.edges),
        metrics: graph.metrics ? JSON.parse(graph.metrics) : undefined,
        sources: graph.sources ? JSON.parse(graph.sources) : [],
        metadata: graph.metadata ? JSON.parse(graph.metadata) : undefined,
        createdAt: graph.createdAt.toISOString(),
        updatedAt: graph.updatedAt.toISOString()
      };
    } catch (error) {
      console.error(`[Database] Failed to get graph ${id}:`, error);
      return null;
    }
  }

  async getAllGraphs(userId: string): Promise<Graph[]> {
    this.ensureInitialized();

    try {
      const graphs = await this.prisma.graph.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' }
      });

      return graphs.map((graph: any) => ({
        id: graph.id,
        name: graph.name,
        description: graph.description || undefined,
        version: graph.version as any,
        directed: graph.directed,
        nodes: JSON.parse(graph.nodes),
        edges: JSON.parse(graph.edges),
        metrics: graph.metrics ? JSON.parse(graph.metrics) : undefined,
        sources: graph.sources ? JSON.parse(graph.sources) : [],
        metadata: graph.metadata ? JSON.parse(graph.metadata) : undefined,
        createdAt: graph.createdAt.toISOString(),
        updatedAt: graph.updatedAt.toISOString()
      }));
    } catch (error) {
      console.error('[Database] Failed to get all graphs:', error);
      return [];
    }
  }

  async deleteGraph(id: string, userId: string): Promise<boolean> {
    this.ensureInitialized();

    try {
      await this.prisma.graph.delete({
        where: { id, userId } as any
      });
      return true;
    } catch (error) {
      console.warn(`[Database] Failed to delete graph ${id} (may not exist):`, error);
      return false;
    }
  }

  // ========== Research Jobs Persistence (Phase 10.3) ==========

  // ========== Research Jobs Persistence (SQLite) ==========

  async saveResearchJob(job: ResearchJobRecord): Promise<any> {
    this.ensureInitialized();

    try {
      const savedJob = await this.prisma.researchJob.upsert({
        where: { id: job.id },
        update: {
          userId: job.userId,
          topic: job.topic,
          mode: job.mode,
          status: job.status,
          progress: job.progress,
          error: job.error,
          queries: JSON.stringify(job.queries || []),
          articlesFound: job.articlesFound,
          articlesProcessed: job.articlesProcessed || 0,
          updatedAt: new Date(),
          includedIds: JSON.stringify(job.includedIds || []),
          excludedIds: JSON.stringify(job.excludedIds || []),
          exclusionReasons: JSON.stringify(job.exclusionReasons || {}),
          reviewText: job.reviewText,
          graphId: job.graphId
        },
        create: {
          id: job.id,
          userId: job.userId,
          topic: job.topic,
          mode: job.mode,
          status: job.status,
          progress: job.progress,
          error: job.error,
          queries: JSON.stringify(job.queries || []),
          articlesFound: job.articlesFound,
          articlesProcessed: job.articlesProcessed || 0,
          createdAt: job.createdAt || new Date(),
          updatedAt: new Date(),
          includedIds: JSON.stringify(job.includedIds || []),
          excludedIds: JSON.stringify(job.excludedIds || []),
          exclusionReasons: JSON.stringify(job.exclusionReasons || {}),
          reviewText: job.reviewText,
          graphId: job.graphId
        }
      });
      console.log(`[Database] Saved research job ${job.id} to SQLite`);
      return savedJob;
    } catch (error) {
      console.error(`[Database] Failed to save job ${job.id}:`, error);
      // Fallback to memory if DB fails? No, simpler to throw or log.
    }
  }

  async getResearchJob(id: string, userId: string): Promise<ResearchJobRecord | null> {
    this.ensureInitialized();

    try {
      const job = await this.prisma.researchJob.findUnique({
        where: { id, userId }
      } as any);

      if (!job) return null;

      // Map Prisma model back to ResearchJobRecord
      const record = {
        id: job.id,
        topic: job.topic,
        mode: job.mode as 'quick' | 'research',
        status: job.status,
        progress: job.progress,
        error: job.error || undefined,
        articlesFound: job.articlesFound,
        queries: JSON.parse(job.queries),
        articles: [], // Will be filled below
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        graphId: job.graphId || undefined,
        // Optional fields
        includedIds: job.includedIds ? JSON.parse(job.includedIds) : undefined,
        excludedIds: job.excludedIds ? JSON.parse(job.excludedIds) : undefined,
        exclusionReasons: job.exclusionReasons ? JSON.parse(job.exclusionReasons) : undefined,
        reviewText: job.reviewText || undefined,
        userId: userId
      } as ResearchJobRecord;

      // Fetch articles
      record.articles = await this.getJobArticles(id, userId);

      return record;
    } catch (error) {
      console.error(`[Database] Failed to get job ${id}:`, error);
      return null;
    }
  }

  async getJobArticles(jobId: string, userId: string): Promise<any[]> {
    this.ensureInitialized();
    try {
      const articles: any[] = await this.prisma.article.findMany({
        where: { jobId, userId }
      } as any);

      return articles.map(a => ({
        id: a.id,
        title: a.title,
        doi: a.doi || undefined,
        authors: JSON.parse(a.authors),
        year: a.year || undefined,
        abstract: a.abstract || undefined,
        url: a.url || undefined,
        pdfUrl: a.pdfUrl || undefined,
        source: a.source as any,
        status: a.status as any,
        screeningStatus: a.screeningStatus as any || undefined,
        extractedData: a.extractedData ? JSON.parse(a.extractedData) : undefined,
        entities: a.entities ? JSON.parse(a.entities) : undefined,
        relations: a.relations ? JSON.parse(a.relations) : undefined
      }));
    } catch (error) {
      console.error(`[Database] Failed to get articles for job ${jobId}:`, error);
      return [];
    }
  }

  async saveJobArticles(jobId: string, userId: string, articles: any[]): Promise<void> {
    this.ensureInitialized();
    try {
      // Use transaction for better performance/integrity
      const operations = articles.map(article =>
        this.prisma.article.upsert({
          where: { id: article.id },
          create: {
            id: article.id,
            userId: userId,
            jobId: jobId,
            title: article.title,
            doi: article.doi,
            authors: JSON.stringify(article.authors || []),
            year: article.year,
            abstract: article.abstract,
            url: article.url,
            pdfUrl: article.pdfUrl,
            source: article.source,
            status: article.status,
            screeningStatus: article.screeningStatus,
            extractedData: article.extractedData ? JSON.stringify(article.extractedData) : undefined,
            entities: article.entities ? JSON.stringify(article.entities) : undefined,
            relations: article.relations ? JSON.stringify(article.relations) : undefined
          },
          update: {
            title: article.title,
            doi: article.doi,
            authors: JSON.stringify(article.authors || []),
            year: article.year,
            abstract: article.abstract,
            url: article.url,
            pdfUrl: article.pdfUrl,
            source: article.source,
            status: article.status,
            screeningStatus: article.screeningStatus,
            extractedData: article.extractedData ? JSON.stringify(article.extractedData) : undefined,
            entities: article.entities ? JSON.stringify(article.entities) : undefined,
            relations: article.relations ? JSON.stringify(article.relations) : undefined,
            updatedAt: new Date()
          }
        })
      );

      await this.prisma.$transaction(operations);
      console.log(`[Database] Saved ${articles.length} articles for job ${jobId}`);
    } catch (error) {
      console.error(`[Database] Failed to save articles for job ${jobId}:`, error);
    }
  }

  async getAllResearchJobs(userId: string): Promise<ResearchJobRecord[]> {
    this.ensureInitialized();

    try {
      const jobs = await this.prisma.researchJob.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return jobs.map((job: any) => ({
        id: job.id,
        topic: job.topic,
        mode: job.mode as 'quick' | 'research',
        status: job.status,
        progress: job.progress,
        error: job.error || undefined,
        articlesFound: job.articlesFound,
        queries: JSON.parse(job.queries) as string[],
        articles: [], // Minimal data for list view
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        graphId: job.graphId || undefined,
        userId: job.userId
      } as ResearchJobRecord));
    } catch (error) {
      console.error('[Database] Failed to get all jobs:', error);
      return [];
    }
  }

  async deleteResearchJob(id: string, userId: string): Promise<boolean> {
    this.ensureInitialized();

    try {
      await this.prisma.researchJob.delete({
        where: { id, userId } as any
      });
      console.log(`[Database] Deleted research job ${id} for user ${userId}`);
      return true;
    } catch (error) {
      console.warn(`[Database] Failed to delete job ${id} (may not exist):`, error);
      return false;
    }
  }

  async close(): Promise<void> {
    this.isInitialized = false;

    this.edges.clear();
    this.patterns.clear();
    this.users.clear();
    // maps cleared
    await this.prisma.$disconnect();

    console.log('[Database] Database connection closed');
  }

  async getMetrics(): Promise<any> {
    this.ensureInitialized();

    // Count jobs from SQLite
    const jobCount = await this.prisma.researchJob.count();

    return {
      articles: await this.prisma.article.count(),
      edges: this.edges.size,
      patterns: this.patterns.size,
      users: this.users.size,
      graphs: await this.prisma.graph.count(),
      researchJobs: jobCount
    };
  }
}

export const databaseManager = new DatabaseManager();
export default DatabaseManager;
