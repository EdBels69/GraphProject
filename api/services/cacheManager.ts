export interface CacheEntry<T> {
  key: string
  value: T
  timestamp: number
  ttl: number // Time to live in milliseconds
  hits: number
}

export interface CacheStats {
  size: number
  hits: number
  misses: number
  hitRate: number
  keys: string[]
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds (default: 5 minutes)
  maxSize?: number // Maximum number of entries (default: 1000)
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>>
  private stats: {
    hits: number
    misses: number
  }
  private maxSize: number
  private defaultTtl: number

  constructor(options: CacheOptions = {}) {
    this.cache = new Map()
    this.maxSize = options.maxSize || 1000
    this.defaultTtl = options.ttl || 5 * 60 * 1000 // 5 minutes
    this.stats = { hits: 0, misses: 0 }

    // Start cleanup interval
    setInterval(() => this.cleanup(), 60 * 1000) // Cleanup every minute
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if expired
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // Update hits
    entry.hits++
    this.stats.hits++

    return entry.value
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTtl

    // Check size limit
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest()
    }

    this.cache.set(key, {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      hits: 0
    })
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0 }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? this.stats.hits / (this.stats.hits + this.stats.misses)
      : 0

    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Get all values
   */
  values<T>(): T[] {
    return Array.from(this.cache.values()).map(entry => entry.value)
  }

  /**
   * Get all entries
   */
  entries<T>(): Array<{ key: string; value: T }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      value: entry.value
    }))
  }

  /**
   * Get or set value (get if exists, otherwise set and return default)
   */
  getOrSet<T>(key: string, defaultValue: T, options?: CacheOptions): T {
    const value = this.get<T>(key)
    if (value !== null) {
      return value
    }

    this.set(key, defaultValue, options)
    return defaultValue
  }

  /**
   * Get multiple values
   */
  getMany<T>(keys: string[]): Map<string, T | null> {
    const result = new Map<string, T | null>()

    for (const key of keys) {
      result.set(key, this.get<T>(key))
    }

    return result
  }

  /**
   * Set multiple values
   */
  setMany<T>(entries: Array<{ key: string; value: T }>, options?: CacheOptions): void {
    for (const { key, value } of entries) {
      this.set(key, value, options)
    }
  }

  /**
   * Delete multiple values
   */
  deleteMany(keys: string[]): number {
    let count = 0
    for (const key of keys) {
      if (this.delete(key)) {
        count++
      }
    }
    return count
  }

  /**
   * Evict oldest entry (LRU eviction)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTimestamp = Infinity

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key)
    }
  }

  /**
   * Warm cache with predefined values
   */
  async warm<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    for (const { key, value, ttl } of entries) {
      this.set(key, value, { ttl })
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0 }
  }

  /**
   * Get cache size in bytes (approximate)
   */
  getSizeInBytes(): number {
    let size = 0

    for (const entry of this.cache.values()) {
      // Approximate size: key + value + metadata
      size += entry.key.length * 2 // UTF-16
      size += JSON.stringify(entry.value).length * 2
      size += 64 // Metadata overhead
    }

    return size
  }

  /**
   * Get cache entry by pattern
   */
  getByPattern(pattern: RegExp): Array<{ key: string; value: any }> {
    const result: Array<{ key: string; value: any }> = []

    for (const [key, entry] of this.cache) {
      if (pattern.test(key)) {
        result.push({ key, value: entry.value })
      }
    }

    return result
  }

  /**
   * Delete entries by pattern
   */
  deleteByPattern(pattern: RegExp): number {
    let count = 0
    const keysToDelete: string[] = []

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      if (this.delete(key)) {
        count++
      }
    }

    return count
  }
}

export default new CacheManager()
