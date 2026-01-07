import SessionManager, { User } from './SessionManager';

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  let mockUser: User;

  beforeEach(() => {
    sessionManager = new SessionManager({
      accessTokenExpiry: 1000,
      refreshTokenExpiry: 2000,
      sessionCleanupInterval: 500,
      maxSessionsPerUser: 3
    });

    mockUser = {
      id: 'user123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      permissions: ['read', 'write'],
      createdAt: new Date()
    };
  });

  afterEach(async () => {
    await sessionManager.shutdown();
  });

  describe('createSession', () => {
    it('should create a session with valid properties', async () => {
      const session = await sessionManager.createSession(mockUser);

      expect(session.userId).toBe(mockUser.id);
      expect(session.user).toEqual(mockUser);
      expect(session.token).toBeDefined();
      expect(session.refreshToken).toBeDefined();
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.expiresAt).toBeInstanceOf(Date);
      expect(session.expiresAt.getTime()).toBeGreaterThan(session.createdAt.getTime());
    });

    it('should include IP address and user agent if provided', async () => {
      const session = await sessionManager.createSession(
        mockUser,
        '192.168.1.1',
        'Mozilla/5.0'
      );

      expect(session.ipAddress).toBe('192.168.1.1');
      expect(session.userAgent).toBe('Mozilla/5.0');
    });

    it('should create multiple sessions for same user', async () => {
      const session1 = await sessionManager.createSession(mockUser);
      const session2 = await sessionManager.createSession(mockUser);

      expect(session1.id).not.toBe(session2.id);
      expect(session1.token).not.toBe(session2.token);
      expect(session1.refreshToken).not.toBe(session2.refreshToken);
    });

    it('should limit sessions per user', async () => {
      await sessionManager.createSession(mockUser);
      await sessionManager.createSession(mockUser);
      await sessionManager.createSession(mockUser);
      await sessionManager.createSession(mockUser);

      const sessions = sessionManager.getUserSessions(mockUser.id);
      expect(sessions.length).toBe(3);
    });

    it('should include metadata if provided', async () => {
      const metadata = { deviceId: 'device123', browser: 'Chrome' };
      const session = await sessionManager.createSession(mockUser, undefined, undefined, metadata);

      expect(session.metadata).toEqual(metadata);
    });
  });

  describe('validateSession', () => {
    it('should validate valid session', async () => {
      const session = await sessionManager.createSession(mockUser);
      const validated = await sessionManager.validateSession(session.token);

      expect(validated).not.toBeNull();
      expect(validated!.id).toBe(session.id);
      expect(validated!.userId).toBe(mockUser.id);
    });

    it('should return null for invalid token', async () => {
      const validated = await sessionManager.validateSession('invalid-token');

      expect(validated).toBeNull();
    });

    it('should return null for expired session', async () => {
      const shortLivedManager = new SessionManager({
        accessTokenExpiry: 100,
        sessionCleanupInterval: 50
      });

      const session = await shortLivedManager.createSession(mockUser);

      await new Promise(resolve => setTimeout(resolve, 150));

      const validated = await shortLivedManager.validateSession(session.token);

      expect(validated).toBeNull();

      await shortLivedManager.shutdown();
    });

    it('should update lastActivityAt on validation', async () => {
      const session = await sessionManager.createSession(mockUser);
      const originalLastActivity = session.lastActivityAt;

      await new Promise(resolve => setTimeout(resolve, 100));

      await sessionManager.validateSession(session.token);
      const validated = await sessionManager.getSession(session.id);

      expect(validated!.lastActivityAt.getTime()).toBeGreaterThan(originalLastActivity.getTime());
    });
  });

  describe('refreshSession', () => {
    it('should refresh valid session', async () => {
      const session = await sessionManager.createSession(mockUser);
      const originalToken = session.token;

      await new Promise(resolve => setTimeout(resolve, 100));

      const refreshed = await sessionManager.refreshSession(session.refreshToken);

      expect(refreshed).not.toBeNull();
      expect(refreshed!.token).not.toBe(originalToken);
      expect(refreshed!.refreshToken).toBe(session.refreshToken);
    });

    it('should return null for invalid refresh token', async () => {
      const refreshed = await sessionManager.refreshSession('invalid-refresh-token');

      expect(refreshed).toBeNull();
    });

    it('should return null for expired refresh token', async () => {
      const shortLivedManager = new SessionManager({
        accessTokenExpiry: 100,
        refreshTokenExpiry: 200,
        sessionCleanupInterval: 50
      });

      const session = await shortLivedManager.createSession(mockUser);

      await new Promise(resolve => setTimeout(resolve, 250));

      const refreshed = await shortLivedManager.refreshSession(session.refreshToken);

      expect(refreshed).toBeNull();

      await shortLivedManager.shutdown();
    });

    it('should update expiresAt on refresh', async () => {
      const session = await sessionManager.createSession(mockUser);
      const originalExpiresAt = session.expiresAt;

      await new Promise(resolve => setTimeout(resolve, 100));

      const refreshed = await sessionManager.refreshSession(session.refreshToken);

      expect(refreshed!.expiresAt.getTime()).toBeGreaterThan(originalExpiresAt.getTime());
    });
  });

  describe('invalidateSession', () => {
    it('should invalidate valid session', async () => {
      const session = await sessionManager.createSession(mockUser);
      const result = await sessionManager.invalidateSession(session.id);

      expect(result).toBe(true);

      const validated = await sessionManager.validateSession(session.token);
      expect(validated).toBeNull();
    });

    it('should return false for non-existent session', async () => {
      const result = await sessionManager.invalidateSession('non-existent-id');

      expect(result).toBe(false);
    });

    it('should remove session from user sessions', async () => {
      const session = await sessionManager.createSession(mockUser);
      await sessionManager.invalidateSession(session.id);

      const userSessions = sessionManager.getUserSessions(mockUser.id);
      expect(userSessions).toHaveLength(0);
    });
  });

  describe('invalidateAllUserSessions', () => {
    it('should invalidate all sessions for user', async () => {
      await sessionManager.createSession(mockUser);
      await sessionManager.createSession(mockUser);
      await sessionManager.createSession(mockUser);

      const count = await sessionManager.invalidateAllUserSessions(mockUser.id);

      expect(count).toBe(3);

      const userSessions = sessionManager.getUserSessions(mockUser.id);
      expect(userSessions).toHaveLength(0);
    });

    it('should return 0 for user with no sessions', async () => {
      const count = await sessionManager.invalidateAllUserSessions('non-existent-user');

      expect(count).toBe(0);
    });
  });

  describe('validatePermission', () => {
    it('should return true for valid permission', async () => {
      const session = await sessionManager.createSession(mockUser);
      const result = await sessionManager.validatePermission(mockUser.id, 'read');

      expect(result).toBe(true);
    });

    it('should return false for invalid permission', async () => {
      const session = await sessionManager.createSession(mockUser);
      const result = await sessionManager.validatePermission(mockUser.id, 'admin');

      expect(result).toBe(false);
    });

    it('should return true for admin user regardless of permission', async () => {
      const adminUser = {
        ...mockUser,
        id: 'admin123',
        role: 'admin' as const,
        permissions: []
      };

      await sessionManager.createSession(adminUser);
      const result = await sessionManager.validatePermission(adminUser.id, 'any-permission');

      expect(result).toBe(true);
    });

    it('should return false for user without active session', async () => {
      const result = await sessionManager.validatePermission('non-existent-user', 'read');

      expect(result).toBe(false);
    });
  });

  describe('getSession', () => {
    it('should return session by id', async () => {
      const session = await sessionManager.createSession(mockUser);
      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(session.id);
    });

    it('should return null for non-existent session', async () => {
      const retrieved = await sessionManager.getSession('non-existent-id');

      expect(retrieved).toBeNull();
    });
  });

  describe('getUserSessions', () => {
    it('should return all sessions for user', async () => {
      const session1 = await sessionManager.createSession(mockUser);
      const session2 = await sessionManager.createSession(mockUser);

      const userSessions = sessionManager.getUserSessions(mockUser.id);

      expect(userSessions).toHaveLength(2);
      expect(userSessions.map(s => s.id)).toContain(session1.id);
      expect(userSessions.map(s => s.id)).toContain(session2.id);
    });

    it('should return empty array for user with no sessions', async () => {
      const userSessions = sessionManager.getUserSessions('non-existent-user');

      expect(userSessions).toHaveLength(0);
    });
  });

  describe('getActiveSessionCount', () => {
    it('should return correct count of active sessions', async () => {
      await sessionManager.createSession(mockUser);
      await sessionManager.createSession(mockUser);

      const count = sessionManager.getActiveSessionCount();

      expect(count).toBe(2);
    });

    it('should return 0 when no sessions exist', () => {
      const count = sessionManager.getActiveSessionCount();

      expect(count).toBe(0);
    });
  });

  describe('getUserCount', () => {
    it('should return correct count of unique users', async () => {
      await sessionManager.createSession(mockUser);

      const user2 = { ...mockUser, id: 'user456', username: 'user2', email: 'user2@example.com' };
      await sessionManager.createSession(user2);

      const count = sessionManager.getUserCount();

      expect(count).toBe(2);
    });

    it('should count user once even with multiple sessions', async () => {
      await sessionManager.createSession(mockUser);
      await sessionManager.createSession(mockUser);

      const count = sessionManager.getUserCount();

      expect(count).toBe(1);
    });
  });

  describe('getSessionMetrics', () => {
    it('should return session metrics', async () => {
      await sessionManager.createSession(mockUser);
      await sessionManager.createSession(mockUser);

      const user2 = { ...mockUser, id: 'user456', username: 'user2', email: 'user2@example.com' };
      await sessionManager.createSession(user2);

      const metrics = sessionManager.getSessionMetrics();

      expect(metrics.totalSessions).toBe(3);
      expect(metrics.totalUsers).toBe(2);
      expect(metrics.sessionsPerUser).toContainEqual(2);
      expect(metrics.sessionsPerUser).toContainEqual(1);
    });
  });

  describe('cleanup', () => {
    it('should clean up expired sessions', async () => {
      const shortLivedManager = new SessionManager({
        accessTokenExpiry: 100,
        sessionCleanupInterval: 50
      });

      await shortLivedManager.createSession(mockUser);

      expect(shortLivedManager.getActiveSessionCount()).toBe(1);

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(shortLivedManager.getActiveSessionCount()).toBe(0);

      await shortLivedManager.shutdown();
    });
  });
});
