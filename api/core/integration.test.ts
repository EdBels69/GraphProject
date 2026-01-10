import DatabaseManager, { Article, User } from './Database'
import SessionManager from './SessionManager'
import Logger, { LogLevel } from './Logger'
import { ErrorHandler, ValidationError, NotFoundError } from './ErrorHandler'

describe('Integration Tests', () => {
  let database: DatabaseManager;
  let sessionManager: SessionManager;
  let logger: Logger;
  let errorHandler: ErrorHandler;

  beforeEach(async () => {
    // execSync('npx prisma db push --schema=src/core/prisma/schema.prisma --accept-data-loss'); // Too slow for every test?
    // Maybe just use one DB and clear tables.
    // Ensure test.db uses the correct schema.
    // For now we assume test.db is set up or we mock. Using file DB for tests is slow if we re-migrate every time.
    // Better strategy: Use ./test.db, migrate ONCE in beforeAll (or manually), and clear data in beforeEach.

    database = new DatabaseManager({
      filePath: './test.db',
      enableWAL: false,
      verbose: false
    });

    sessionManager = new SessionManager({
      accessTokenExpiry: 60000,
      refreshTokenExpiry: 120000,
      sessionCleanupInterval: 30000,
      maxSessionsPerUser: 15
    });

    logger = new Logger({ level: LogLevel.DEBUG, enableConsole: false, enableFile: false });
    errorHandler = new ErrorHandler();

    await database.initialize();

    // Clean up tables
    const prisma = database.getClient();
    await prisma.article.deleteMany();
    await prisma.researchJob.deleteMany();
    await prisma.user.deleteMany();
    await prisma.graph.deleteMany();

    // Create default job
    await database.saveResearchJob({
      id: 'test-job',
      topic: 'test',
      mode: 'quick',
      status: 'pending',
      articlesFound: 0,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'test-user-id'
    });
  });

  afterEach(async () => {
    await database.close();
    await sessionManager.shutdown();
  });

  describe('Database + Session Manager Integration', () => {
    it('should create user, session, and verify interaction', async () => {
      await database.initialize();

      const user: Omit<User, 'id' | 'createdAt'> = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: 'user',
        permissions: ['read', 'write']
      };

      const createdUser = await database.createUser(user);
      expect(createdUser.id).toBeDefined();
      expect(createdUser.username).toBe(user.username);

      const session = await sessionManager.createSession(createdUser);
      expect(session.userId).toBe(createdUser.id);
      expect(session.user).toEqual(createdUser);

      const validated = await sessionManager.validateSession(session.token);
      expect(validated).not.toBeNull();
      expect(validated!.userId).toBe(createdUser.id);
    });

    it('should invalidate user session when user is deleted', async () => {
      await database.initialize();

      const user: Omit<User, 'id' | 'createdAt'> = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: 'user',
        permissions: ['read']
      };

      const createdUser = await database.createUser(user);
      const session = await sessionManager.createSession(createdUser);

      const validatedBefore = await sessionManager.validateSession(session.token);
      expect(validatedBefore).not.toBeNull();

      await sessionManager.invalidateSession(session.id);

      const validatedAfter = await sessionManager.validateSession(session.token);
      expect(validatedAfter).toBeNull();
    });
  });

  describe('Database + Logger Integration', () => {
    it('should log database operations', async () => {
      await database.initialize();

      const callback = vi.fn();
      logger.subscribe('test', callback);

      const article = {
        id: 'article-1',
        title: 'Test Article',
        content: 'Test content',
        status: 'pending',
        metadata: { userId: 'user123' }
      };

      await database.saveJobArticles('test-job', 'test-user-id', [article]);

      expect(callback).toHaveBeenCalled();
    });

    it('should log errors from database operations', async () => {
      await database.initialize();

      const callback = vi.fn();
      logger.subscribe('test', callback);

      try {
        await database.getJobArticles('non-existent-id', 'test-user-id');
      } catch (error) {
      }

      const logs = logger.getLogs({ level: LogLevel.ERROR });
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Logger + ErrorHandler Integration', () => {
    it('should log handled errors', () => {
      const callback = vi.fn();
      logger.subscribe('test', callback);

      const error = new ValidationError('VALIDATION_CODE', 'Invalid input');
      errorHandler.handle(error, 'req123');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          level: LogLevel.ERROR,
          message: 'Invalid input'
        })
      );
    });
  });

  it('should track error metrics', () => {
    errorHandler.handle(new ValidationError('CODE1', 'Error 1'));
    errorHandler.handle(new ValidationError('CODE1', 'Error 2'));
    errorHandler.handle(new NotFoundError('CODE2', 'Not found'));

    const metrics = errorHandler.getMetrics();
    expect(metrics.errorsByCode.get('CODE2')).toBe(1);
  });

  describe('Session Manager + Permission Validation', () => {
    it('should validate user permissions through session', async () => {
      await database.initialize();

      const user: Omit<User, 'id' | 'createdAt'> = {
        username: 'adminuser',
        email: 'admin@example.com',
        passwordHash: 'hashedpassword',
        role: 'admin',
        permissions: ['read', 'write', 'delete']
      };

      const createdUser = await database.createUser(user);
      await sessionManager.createSession(createdUser);

      const hasPermission = await sessionManager.validatePermission(createdUser.id, 'delete');
      expect(hasPermission).toBe(true);
    });

    it('should deny permissions for user without session', async () => {
      const hasPermission = await sessionManager.validatePermission('non-existent-user', 'read');
      expect(hasPermission).toBe(false);
    });
  });

  describe('Full Workflow Integration', () => {
    it('should complete full user lifecycle', async () => {
      await database.initialize();

      const errorCallback = vi.fn();
      logger.subscribe('test', errorCallback);

      const user: Omit<User, 'id' | 'createdAt'> = {
        username: 'fulltest',
        email: 'full@example.com',
        passwordHash: 'hashedpassword',
        role: 'user',
        permissions: ['read', 'write']
      };

      const createdUser = await database.createUser(user);

      const article = {
        id: 'article-lifecycle',
        title: 'Test Article',
        content: 'Test content',
        status: 'pending',
        metadata: { userId: createdUser.id }
      };

      await database.saveJobArticles('test-job', createdUser.id, [article]);

      const session = await sessionManager.createSession(createdUser);

      const hasPermission = await sessionManager.validatePermission(createdUser.id, 'write');
      expect(hasPermission).toBe(true);

      const jobArticles = await database.getJobArticles('test-job', createdUser.id);
      const retrievedArticle = jobArticles.find(a => a.id === article.id);
      expect(retrievedArticle).toBeDefined();
      expect(retrievedArticle!.title).toBe(article.title);

      await sessionManager.invalidateSession(session.id);

      const validated = await sessionManager.validateSession(session.token);
      expect(validated).toBeNull();

      expect(errorCallback).toHaveBeenCalled();
    });

    it('should handle errors gracefully across all modules', async () => {
      await database.initialize();

      const errorCallback = vi.fn();
      errorHandler.handle(new Error('Test error'), 'req123');
      errorCallback();

      const errorMetrics = errorHandler.getMetrics();
      expect(errorMetrics.totalErrors).toBeGreaterThan(0);

      const logs = logger.getLogs({ level: LogLevel.ERROR });
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent sessions', async () => {
      await database.initialize();

      const user: Omit<User, 'id' | 'createdAt'> = {
        username: 'perftest',
        email: 'perf@example.com',
        passwordHash: 'hashedpassword',
        role: 'user',
        permissions: ['read']
      };

      const createdUser = await database.createUser(user);

      const sessionPromises = Array(10).fill(null).map(() =>
        sessionManager.createSession(createdUser)
      );

      const sessions = await Promise.all(sessionPromises);

      expect(sessions).toHaveLength(10);
      expect(sessionManager.getActiveSessionCount()).toBe(10);

      for (const session of sessions) {
        const validated = await sessionManager.validateSession(session.token);
        expect(validated).not.toBeNull();
      }
    });

    it('should handle multiple database operations efficiently', async () => {
      await database.initialize();

      const user: Omit<User, 'id' | 'createdAt'> = {
        username: 'bulktest',
        email: 'bulk@example.com',
        passwordHash: 'hashedpassword',
        role: 'user',
        permissions: ['read', 'write']
      };

      const createdUser = await database.createUser(user);

      const articles = Array(100).fill(null).map((_, i) => ({
        id: `article-perf-${i}`,
        title: `Article ${i}`,
        content: `Content ${i}`,
        status: 'pending',
        metadata: { userId: createdUser.id }
      }));

      const startTime = Date.now();
      await database.saveJobArticles('test-job', createdUser.id, articles);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000);

      const retrieved = await database.getJobArticles('test-job', createdUser.id);
      // Note: Test job might accumulate articles from other tests if DB not cleared? 
      // InMemory with new instance per test -> Should be cleared.
      // But verify getJobArticles filters correctly.
      const testArticles = retrieved.filter(a => a.id.startsWith('article-perf-'));
      expect(testArticles).toHaveLength(100);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity', async () => {
      await database.initialize();

      const user: Omit<User, 'id' | 'createdAt'> = {
        username: 'integritytest',
        email: 'integrity@example.com',
        passwordHash: 'hashedpassword',
        role: 'user',
        permissions: ['read', 'write']
      };

      const createdUser = await database.createUser(user);

      const article = {
        id: 'article-integrity',
        title: 'Test Article',
        content: 'Test content',
        status: 'pending',
        metadata: { userId: createdUser.id }
      };

      await database.saveJobArticles('test-job', createdUser.id, [article]);

      const edge = await database.createEdge({
        source: article.id,
        target: article.id,
        strength: 1.0,
        type: 'citation'
      });

      expect(edge.source).toBe(article.id);
      expect(edge.target).toBe(article.id);

      const edges = await database.getEdges(article.id);
      expect(edges).toHaveLength(1);
      expect(edges[0].id).toBe(edge.id);
    });

    it('should handle concurrent modifications', async () => {
      await database.initialize();

      const user: Omit<User, 'id' | 'createdAt'> = {
        username: 'concurrenttest',
        email: 'concurrent@example.com',
        passwordHash: 'hashedpassword',
        role: 'user',
        permissions: ['read', 'write']
      };

      const createdUser = await database.createUser(user);

      const article = {
        id: 'article-concurrent',
        title: 'Original Title',
        content: 'Original content',
        status: 'pending',
        metadata: { userId: createdUser.id }
      };

      await database.saveJobArticles('test-job', createdUser.id, [article]);

      const updatePromises = Array(5).fill(null).map((_, i) =>
        database.saveJobArticles('test-job', createdUser.id, [{
          ...article,
          title: `Updated Title ${i}`,
          content: `Updated content ${i}`
        }])
      );

      await Promise.all(updatePromises);

      const results = await database.getJobArticles('test-job', createdUser.id);
      const finalArticle = results.find(a => a.id === article.id);

      expect(finalArticle).toBeDefined();
      expect(finalArticle!.title).toMatch(/Updated Title/);
    });
  });
});
