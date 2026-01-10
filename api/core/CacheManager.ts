import { logger } from './Logger';

export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number;
  private maxEntries: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(defaultTTL: number = 5 * 60 * 1000, maxEntries: number = 1000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.maxEntries = maxEntries;

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);

    logger.info('CacheManager', 'Cache manager initialized', {
      defaultTTL: `${defaultTTL / 1000}s`,
      maxEntries
    });
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, entry);

    if (this.cache.size > this.maxEntries) {
      this.evictOldest();
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      logger.debug('CacheManager', `Cache entry expired: ${key}`);
      return null;
    }

    return entry.value as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    logger.info('CacheManager', 'Cache cleared');
  }

  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    logger.info('CacheManager', `Cleared ${keysToDelete.length} entries matching pattern: ${pattern}`);
  }

  getStats(): { size: number; hitRate: number; memoryUsage: string } {
    const size = this.cache.size;
    const memoryUsage = `${JSON.stringify(Array.from(this.cache.values())).length} bytes`;

    return {
      size,
      hitRate: 0,
      memoryUsage
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      logger.debug('CacheManager', `Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('CacheManager', `Evicted oldest cache entry: ${oldestKey}`);
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
    logger.info('CacheManager', 'Cache manager destroyed');
  }
}

export const cacheManager = new CacheManager(5 * 60 * 1000, 1000);
export default CacheManager;
