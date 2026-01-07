import { v4 as uuidv4 } from 'uuid';
import { DatabaseError } from './ErrorHandler';
import { Graph } from '../../shared/types';

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

export interface DatabaseConfig {
  filePath: string;
  enableWAL: boolean;
  verbose: boolean;
}

export class DatabaseManager {
  private articles: Map<string, Article> = new Map();
  private edges: Map<string, ArticleEdge> = new Map();
  private patterns: Map<string, Pattern> = new Map();
  private users: Map<string, User> = new Map();
  private graphs: Map<string, Graph> = new Map();
  private isInitialized = false;

  constructor(config: Partial<DatabaseConfig> = {}) {
    // In-memory storage - no config needed
  }

  async initialize(): Promise<void> {
    try {
      this.isInitialized = true;
      console.log('[Database] In-memory database initialized successfully');
    } catch (error) {
      console.error('[Database] Failed to initialize database:', error);
      throw new DatabaseError('DB_INIT_ERROR', 'Failed to initialize database', { error });
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new DatabaseError('DB_NOT_INITIALIZED', 'Database not initialized');
    }
  }

  async createArticle(article: Omit<Article, 'id' | 'uploadedAt'>): Promise<Article> {
    this.ensureInitialized();

    const id = uuidv4();
    const uploadedAt = new Date();

    const newArticle: Article = {
      ...article,
      id,
      uploadedAt
    };

    this.articles.set(id, newArticle);

    console.log(`[Database] Created article ${id}`, { title: article.title });

    return newArticle;
  }

  async getArticle(id: string): Promise<Article | null> {
    this.ensureInitialized();

    const article = this.articles.get(id);

    if (!article) {
      console.warn(`[Database] Article ${id} not found`);
      return null;
    }

    return article;
  }

  async getArticles(filter?: { status?: string; userId?: string; limit?: number; offset?: number }): Promise<Article[]> {
    this.ensureInitialized();

    let articles = Array.from(this.articles.values());

    if (filter?.status) {
      articles = articles.filter(a => a.status === filter.status);
    }

    if (filter?.userId) {
      articles = articles.filter(a => a.userId === filter.userId);
    }

    articles.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    if (filter?.limit) {
      articles = articles.slice(filter.offset || 0, filter.limit);
    }

    if (filter?.offset) {
      articles = articles.slice(filter.offset || 0, filter.limit);
    }

    console.log(`[Database] Retrieved ${articles.length} articles`);

    return articles;
  }

  async updateArticle(id: string, updates: Partial<Omit<Article, 'id' | 'uploadedAt'>>): Promise<Article | null> {
    this.ensureInitialized();

    const existing = this.articles.get(id);

    if (!existing) {
      console.warn(`[Database] Article ${id} not found`);
      return null;
    }

    const updated: Article = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    this.articles.set(id, updated);

    console.log(`[Database] Updated article ${id}`);

    return this.getArticle(id);
  }

  async deleteArticle(id: string): Promise<boolean> {
    this.ensureInitialized();

    const deleted = this.articles.delete(id);

    if (deleted) {
      console.log(`[Database] Deleted article ${id}`);
      return true;
    }

    console.warn(`[Database] Article ${id} not found`);
    return false;
  }

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

    this.graphs.set(graph.id, graph);

    console.log(`[Database] Saved graph ${graph.id}`, {
      nodes: graph.nodes.length,
      edges: graph.edges.length
    });
  }

  async getGraphFromDb(id: string): Promise<Graph | null> {
    this.ensureInitialized();

    const graph = this.graphs.get(id);

    if (!graph) {
      console.warn(`[Database] Graph ${id} not found`);
      return null;
    }

    return graph;
  }

  async getAllGraphs(): Promise<Graph[]> {
    this.ensureInitialized();

    const graphs = Array.from(this.graphs.values());

    console.log(`[Database] Loaded ${graphs.length} graphs from database`);

    return graphs;
  }

  async deleteGraph(id: string): Promise<boolean> {
    this.ensureInitialized();

    const deleted = this.graphs.delete(id);

    if (deleted) {
      console.log(`[Database] Graph ${id} deleted from database`);
      return true;
    }

    console.warn(`[Database] Graph ${id} not found`);
    return false;
  }

  async close(): Promise<void> {
    this.isInitialized = false;
    this.articles.clear();
    this.edges.clear();
    this.patterns.clear();
    this.users.clear();
    this.graphs.clear();

    console.log('[Database] In-memory database connection closed');
  }

  getMetrics(): any {
    this.ensureInitialized();

    return {
      articles: this.articles.size,
      edges: this.edges.size,
      patterns: this.patterns.size,
      users: this.users.size,
      graphs: this.graphs.size
    };
  }
}

export const databaseManager = new DatabaseManager();
export default DatabaseManager;
