import fs from 'fs';
import path from 'path';
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
  private saveInterval: NodeJS.Timeout;
  private cacheFilePath: string;

  constructor(defaultTTL: number = 5 * 60 * 1000, maxEntries: number = 1000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.maxEntries = maxEntries;
    this.cacheFilePath = path.join(process.cwd(), 'api', 'data', 'cache.json');

    this.load();

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);

    this.saveInterval = setInterval(() => {
      this.save();
    }, 60 * 1000);

    logger.info('CacheManager', 'Cache manager initialized (Persistent)', {
      defaultTTL: `${defaultTTL / 1000}s`,
      maxEntries,
      path: this.cacheFilePath
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

  private load(): void {
    try {
      if (!fs.existsSync(this.cacheFilePath)) return;

      const data = fs.readFileSync(this.cacheFilePath, 'utf-8');
      const entries: CacheEntry<any>[] = JSON.parse(data);

      if (Array.isArray(entries)) {
        const now = Date.now();
        let loadedCount = 0;
        entries.forEach(entry => {
          if (now - entry.timestamp <= entry.ttl) {
            this.cache.set(entry.key, entry);
            loadedCount++;
          }
        });
        logger.info('CacheManager', `Loaded ${loadedCount} entries from disk`);
      }
    } catch (error) {
      logger.warn('CacheManager', 'Failed to load cache', { error });
    }
  }

  private save(): void {
    try {
      const dir = path.dirname(this.cacheFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const entries = Array.from(this.cache.values());
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(entries));
    } catch (error) {
      logger.error('CacheManager', 'Failed to save cache', { error });
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    clearInterval(this.saveInterval);
    this.save();
    this.cache.clear();
    logger.info('CacheManager', 'Cache manager destroyed');
  }
}

export const cacheManager = new CacheManager(5 * 60 * 1000, 1000);
export default CacheManager;
