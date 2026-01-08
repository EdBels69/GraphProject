import { v4 as uuidv4 } from 'uuid';
import { logger, LogLevel } from './Logger';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  permissions: string[];
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Session {
  id: string;
  userId: string;
  user: User;
  token: string;
  refreshToken: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export interface SessionConfig {
  accessTokenExpiry: number;
  refreshTokenExpiry: number;
  sessionCleanupInterval: number;
  maxSessionsPerUser: number;
}

class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();
  private config: SessionConfig;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = {
      accessTokenExpiry: 60 * 60 * 1000,
      refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000,
      sessionCleanupInterval: 5 * 60 * 1000,
      maxSessionsPerUser: 5,
      ...config
    };

    this.startCleanup();
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.config.sessionCleanupInterval);
  }

  private stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(sessionId);

        const userSessions = this.userSessions.get(session.userId);
        if (userSessions) {
          userSessions.delete(sessionId);
          if (userSessions.size === 0) {
            this.userSessions.delete(session.userId);
          }
        }

        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('SessionManager', `Cleaned up ${cleaned} expired sessions`);
    }
  }

  async createSession(
    user: User,
    ipAddress?: string,
    userAgent?: string,
    metadata?: any
  ): Promise<Session> {
    const sessionId = uuidv4();
    const token = this.generateToken();
    const refreshToken = this.generateToken();
    const now = new Date();

    const session: Session = {
      id: sessionId,
      userId: user.id,
      user,
      token,
      refreshToken,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.config.accessTokenExpiry),
      lastActivityAt: now,
      ipAddress,
      userAgent,
      metadata
    };

    const userSessions = this.userSessions.get(user.id) || new Set();
    if (userSessions.size >= this.config.maxSessionsPerUser) {
      const oldestSessionId = userSessions.values().next().value;
      if (oldestSessionId) {
        this.sessions.delete(oldestSessionId);
        userSessions.delete(oldestSessionId);
      }
    }

    userSessions.add(sessionId);
    this.userSessions.set(user.id, userSessions);
    this.sessions.set(sessionId, session);

    logger.info('SessionManager', `Created session for user ${user.username}`, {
      sessionId,
      userId: user.id,
      ipAddress,
      userAgent
    });

    return session;
  }

  async refreshSession(refreshToken: string): Promise<Session | null> {
    const session = Array.from(this.sessions.values()).find(
      s => s.refreshToken === refreshToken
    );

    if (!session) {
      logger.warn('SessionManager', 'Invalid refresh token attempt', { refreshToken });
      return null;
    }

    const now = new Date();
    const refreshExpiry = new Date(session.createdAt.getTime() + this.config.refreshTokenExpiry);

    if (refreshExpiry <= now) {
      logger.warn('SessionManager', 'Refresh token expired', { sessionId: session.id });
      this.invalidateSession(session.id);
      return null;
    }

    session.token = this.generateToken();
    session.expiresAt = new Date(now.getTime() + this.config.accessTokenExpiry);
    session.lastActivityAt = now;

    logger.info('SessionManager', `Refreshed session for user ${session.user.username}`, {
      sessionId: session.id,
      userId: session.userId
    });

    return session;
  }

  async validateSession(token: string): Promise<Session | null> {
    const session = Array.from(this.sessions.values()).find(
      s => s.token === token
    );

    if (!session) {
      return null;
    }

    const now = new Date();
    if (session.expiresAt <= now) {
      logger.info('SessionManager', 'Session expired', { sessionId: session.id });
      this.invalidateSession(session.id);
      return null;
    }

    session.lastActivityAt = now;
    return session;
  }

  async invalidateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    this.sessions.delete(sessionId);

    const userSessions = this.userSessions.get(session.userId);
    if (userSessions) {
      userSessions.delete(sessionId);
      if (userSessions.size === 0) {
        this.userSessions.delete(session.userId);
      }
    }

    logger.info('SessionManager', `Invalidated session ${sessionId}`, {
      userId: session.userId
    });

    return true;
  }

  async invalidateAllUserSessions(userId: string): Promise<number> {
    const userSessions = this.userSessions.get(userId);
    if (!userSessions) {
      return 0;
    }

    let count = 0;
    for (const sessionId of userSessions) {
      this.sessions.delete(sessionId);
      count++;
    }

    this.userSessions.delete(userId);

    logger.info('SessionManager', `Invalidated all sessions for user ${userId}`, { count });

    return count;
  }

  async validatePermission(userId: string, permission: string): Promise<boolean> {
    const userSession = Array.from(this.sessions.values()).find(
      s => s.userId === userId
    );

    if (!userSession) {
      return false;
    }

    const user = userSession.user;
    return user.permissions.includes(permission) || user.role === 'admin';
  }

  async getSession(sessionId: string): Promise<Session | null> {
    return this.sessions.get(sessionId) || null;
  }

  getUserSessions(userId: string): Session[] {
    const userSessionIds = this.userSessions.get(userId);
    if (!userSessionIds) {
      return [];
    }

    return Array.from(userSessionIds)
      .map(id => this.sessions.get(id))
      .filter((session): session is Session => session !== undefined);
  }

  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  getUserCount(): number {
    return this.userSessions.size;
  }

  getSessionMetrics(): any {
    return {
      totalSessions: this.sessions.size,
      totalUsers: this.userSessions.size,
      sessionsPerUser: Array.from(this.userSessions.values()).map(sessions => sessions.size)
    };
  }

  private generateToken(): string {
    return uuidv4() + '-' + Date.now().toString(36);
  }

  async shutdown(): Promise<void> {
    this.stopCleanup();
    this.sessions.clear();
    this.userSessions.clear();
    logger.info('SessionManager', 'Session manager shutdown complete');
  }
}

export const sessionManager = new SessionManager();
export default SessionManager;
