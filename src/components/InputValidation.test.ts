import { describe, it, expect } from 'vitest'
import { validateArticleInput, getArticleInputType, validateArticleInputs } from './InputValidation'

describe('InputValidation', () => {
  describe('validateArticleInput', () => {
    it('should validate URL input correctly', () => {
      const result = validateArticleInput('https://example.com/article', 'url')
      expect(result.isValid).toBe(true)
      expect(result.error).toBe(null)
    })

    it('should reject invalid URL', () => {
      const result = validateArticleInput('not-a-url', 'url')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('URL')
    })

    it('should validate DOI input correctly', () => {
      const result = validateArticleInput('10.1234/example.doi', 'doi')
      expect(result.isValid).toBe(true)
      expect(result.error).toBe(null)
    })

    it('should reject invalid DOI', () => {
      const result = validateArticleInput('not-a-doi', 'doi')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('DOI')
    })

    it('should validate PMID input correctly', () => {
      const result = validateArticleInput('12345678', 'pmid')
      expect(result.isValid).toBe(true)
      expect(result.error).toBe(null)
    })

    it('should reject invalid PMID (non-numeric)', () => {
      const result = validateArticleInput('abc123', 'pmid')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('PMID')
    })

    it('should validate bibliographic input correctly', () => {
      const result = validateArticleInput('Smith J et al. (2023) Example article title', 'bibliographic')
      expect(result.isValid).toBe(true)
      expect(result.error).toBe(null)
    })

    it('should reject empty input', () => {
      const result = validateArticleInput('', 'url')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Поле не может быть пустым')
    })
  })

  describe('getArticleInputType', () => {
    it('should detect DOI format', () => {
      const type = getArticleInputType('10.1234/example.doi')
      expect(type).toBe('doi')
    })

    it('should detect PMID format', () => {
      const type = getArticleInputType('12345678')
      expect(type).toBe('pmid')
    })

    it('should detect URL format', () => {
      const type = getArticleInputType('https://example.com')
      expect(type).toBe('url')
    })

    it('should default to bibliographic for other formats', () => {
      const type = getArticleInputType('Smith J et al. (2023)')
      expect(type).toBe('bibliographic')
    })
  })

  describe('validateArticleInputs', () => {
    it('should validate multiple inputs correctly', () => {
      const inputs = [
        { value: 'https://example.com/article1', type: 'url' as const },
        { value: '10.1234/example.doi', type: 'doi' as const },
        { value: '12345678', type: 'pmid' as const }
      ]

      const results = validateArticleInputs(inputs)
      expect(results).toHaveLength(3)
      expect(results.every(r => r.isValid)).toBe(true)
    })

    it('should return errors for invalid inputs', () => {
      const inputs = [
        { value: 'not-a-url', type: 'url' as const },
        { value: '10.1234/example.doi', type: 'doi' as const }
      ]

      const results = validateArticleInputs(inputs)
      expect(results[0].isValid).toBe(false)
      expect(results[1].isValid).toBe(true)
    })
  })
})
