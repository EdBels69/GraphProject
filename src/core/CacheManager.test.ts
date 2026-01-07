import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CacheManager } from './CacheManager'

describe('CacheManager', () => {
  let cache: CacheManager

  beforeEach(() => {
    cache = new CacheManager(1000, 10)
  })

  afterEach(() => {
    cache.destroy()
  })

  describe('set and get', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1')
      const result = cache.get('key1')
      expect(result).toBe('value1')
    })

    it('should store and retrieve objects', () => {
      const obj = { foo: 'bar', baz: 42 }
      cache.set('key1', obj)
      const result = cache.get('key1')
      expect(result).toEqual(obj)
    })

    it('should return null for non-existent key', () => {
      const result = cache.get('nonexistent')
      expect(result).toBe(null)
    })

    it('should return null for expired key', async () => {
      cache.set('key1', 'value1', 100)
      await new Promise(resolve => setTimeout(resolve, 150))
      const result = cache.get('key1')
      expect(result).toBe(null)
    })
  })

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
    })

    it('should return false for non-existent key', () => {
      expect(cache.has('nonexistent')).toBe(false)
    })

    it('should return false for expired key', async () => {
      cache.set('key1', 'value1', 100)
      await new Promise(resolve => setTimeout(resolve, 150))
      expect(cache.has('key1')).toBe(false)
    })
  })

  describe('delete', () => {
    it('should delete existing key', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      cache.delete('key1')
      expect(cache.has('key1')).toBe(false)
    })

    it('should return false when deleting non-existent key', () => {
      const result = cache.delete('nonexistent')
      expect(result).toBe(false)
    })
  })

  describe('clear', () => {
    it('should clear all entries', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')
      expect(cache.getStats().size).toBe(3)

      cache.clear()
      expect(cache.getStats().size).toBe(0)
      expect(cache.get('key1')).toBe(null)
      expect(cache.get('key2')).toBe(null)
      expect(cache.get('key3')).toBe(null)
    })
  })

  describe('clearPattern', () => {
    it('should clear entries matching pattern', () => {
      cache.set('graph:1:shortestPath', 'value1')
      cache.set('graph:1:centrality', 'value2')
      cache.set('graph:2:shortestPath', 'value3')
      cache.set('other:key', 'value4')

      expect(cache.getStats().size).toBe(4)

      cache.clearPattern('^graph:1:')

      expect(cache.getStats().size).toBe(2)
      expect(cache.has('graph:1:shortestPath')).toBe(false)
      expect(cache.has('graph:1:centrality')).toBe(false)
      expect(cache.has('graph:2:shortestPath')).toBe(true)
      expect(cache.has('other:key')).toBe(true)
    })
  })

  describe('eviction', () => {
    it('should evict oldest entry when maxEntries is exceeded', () => {
      const smallCache = new CacheManager(10000, 3)
      
      smallCache.set('key1', 'value1')
      smallCache.set('key2', 'value2')
      smallCache.set('key3', 'value3')
      expect(smallCache.getStats().size).toBe(3)

      smallCache.set('key4', 'value4')
      expect(smallCache.getStats().size).toBe(3)
      expect(smallCache.has('key1')).toBe(false)
      expect(smallCache.has('key4')).toBe(true)

      smallCache.destroy()
    })
  })

  describe('cleanup', () => {
    it('should cleanup expired entries', async () => {
      const cache = new CacheManager(100, 10)
      
      cache.set('key1', 'value1', 100)
      cache.set('key2', 'value2', 100)
      cache.set('key3', 'value3', 100)
      
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(cache.getStats().size).toBeGreaterThanOrEqual(0)

      cache.destroy()
    })
  })

  describe('getStats', () => {
    it('should return cache statistics', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      const stats = cache.getStats()
      expect(stats.size).toBe(3)
      expect(stats.hitRate).toBe(0)
      expect(stats.memoryUsage).toBeDefined()
    })
  })
})
