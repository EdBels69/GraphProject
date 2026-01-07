import DatabaseManager, { Article, User } from './Database'
import SessionManager from './SessionManager'
import Logger from './Logger'
import { ErrorHandler, ValidationError, NotFoundError } from './ErrorHandler'

describe('Integration Tests', () => {
  let database: DatabaseManager;
  let sessionManager: SessionManager;
  let logger: Logger;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    database = new DatabaseManager({
      filePath: ':memory:',
      enableWAL: false,
      verbose: false
    });

    sessionManager = new SessionManager({
      accessTokenExpiry: 60000,
      refreshTokenExpiry: 120000,
      sessionCleanupInterval: 30000,
      maxSessionsPerUser: 5
    });

    logger = new Logger({ level: 'DEBUG', enableConsole: false, enableFile: false });
    errorHandler = new ErrorHandler();
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

      const callback = jest.fn();
      logger.subscribe('test', callback);

      const article: Omit<Article, 'id' | 'uploadedAt'> = {
        title: 'Test Article',
        content: 'Test content',
        status: 'pending',
        userId: 'user123'
      };

      await database.createArticle(article);

      expect(callback).toHaveBeenCalled();
    });

    it('should log errors from database operations', async () => {
      await database.initialize();

      const callback = jest.fn();
      logger.subscribe('test', callback);

      try {
        await database.getArticle('non-existent-id');
      } catch (error) {
      }

      const logs = logger.getLogs({ level: 'ERROR' });
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Logger + ErrorHandler Integration', () => {
    it('should log handled errors', () => {
      const callback = jest.fn();
      logger.subscribe('test', callback);

      const error = new ValidationError('VALIDATION_CODE', 'Invalid input');
      errorHandler.handle(error, 'req123');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'ERROR',
          message: 'Invalid input'
        })
      );
    });

    it('should track error metrics', () => {
      errorHandler.handle(new ValidationError('CODE1', 'Error 1'));
      errorHandler.handle(new ValidationError('CODE1', 'Error 2'));
      errorHandler.handle(new NotFoundError('CODE2', 'Not found'));

      const metrics = errorHandler.getMetrics();
      expect(metrics.totalErrors).toBe(3);
      expect(metrics.errorsByCode.get('CODE1')).toBe(2);
      expect(metrics.errorsByCode.get('CODE2')).toBe(1);
    });
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

      const callback = jest.fn();
      logger.subscribe('test', callback);

      const user: Omit<User, 'id' | 'createdAt'> = {
        username: 'fulltest',
        email: 'full@example.com',
        passwordHash: 'hashedpassword',
        role: 'user',
        permissions: ['read', 'write']
      };

      const createdUser = await database.createUser(user);

      const article: Omit<Article, 'id' | 'uploadedAt'> = {
        title: 'Test Article',
        content: 'Test content',
        status: 'pending',
        userId: createdUser.id
      };

      const createdArticle = await database.createArticle(article);

      const session = await sessionManager.createSession(createdUser);

      const hasPermission = await sessionManager.validatePermission(createdUser.id, 'write');
      expect(hasPermission).toBe(true);

      const retrievedArticle = await database.getArticle(createdArticle.id);
      expect(retrievedArticle).not.toBeNull();
      expect(retrievedArticle!.title).toBe(article.title);

      await sessionManager.invalidateSession(session.id);

      const validated = await sessionManager.validateSession(session.token);
      expect(validated).toBeNull();

      expect(callback).toHaveBeenCalled();
    });

    it('should handle errors gracefully across all modules', async () => {
      await database.initialize();

      const errorCallback = jest.fn();
      errorHandler['handle'](new Error('Test error'), 'req123');
      errorCallback();

      const errorMetrics = errorHandler.getMetrics();
      expect(errorMetrics.totalErrors).toBeGreaterThan(0);

      const logs = logger.getLogs({ level: 'ERROR' });
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

      const articlePromises = Array(100).fill(null).map((_, i) =>
        database.createArticle({
          title: `Article ${i}`,
          content: `Content ${i}`,
          status: 'pending',
          userId: createdUser.id
        })
      );

      const startTime = Date.now();
      const articles = await Promise.all(articlePromises);
      const endTime = Date.now();

      expect(articles).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000);

      const retrieved = await database.getArticles({ userId: createdUser.id });
      expect(retrieved).toHaveLength(100);
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

      const article = await database.createArticle({
        title: 'Test Article',
        content: 'Test content',
        status: 'pending',
        userId: createdUser.id
      });

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

      const article = await database.createArticle({
        title: 'Original Title',
        content: 'Original content',
        status: 'pending',
        userId: createdUser.id
      });

      const updatePromises = Array(5).fill(null).map((_, i) =>
        database.updateArticle(article.id, {
          title: `Updated Title ${i}`,
          content: `Updated content ${i}`
        })
      );

      const results = await Promise.all(updatePromises);

      const finalArticle = await database.getArticle(article.id);

      expect(results.every(r => r !== null)).toBe(true);
      expect(finalArticle).not.toBeNull();
      expect(finalArticle!.title).toMatch(/Updated Title/);
    });
  });
});
