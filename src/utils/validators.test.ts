import { describe, it, expect } from 'vitest'
import {
  validateArticle,
  validateGraph,
  validateURL,
  validateFileUpload,
  validatePubMedQuery
} from './validators'

describe('validators', () => {
  describe('validateArticle', () => {
    it('should validate a valid article', () => {
      const article = {
        id: 'article-1',
        title: 'Test Article',
        authors: ['Author 1', 'Author 2'],
        year: 2023,
        abstract: 'Test abstract',
        keywords: ['keyword1', 'keyword2'],
        citations: ['citation-1']
      }

      const result = validateArticle(article)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject article without title', () => {
      const article = {
        id: 'article-1',
        title: '',
        authors: ['Author 1'],
        year: 2023
      }

      const result = validateArticle(article)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Заголовок статьи обязателен')
    })

    it('should reject article without id', () => {
      const article = {
        title: 'Test Article',
        authors: ['Author 1'],
        year: 2023
      }

      const result = validateArticle(article)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('ID статьи обязателен')
    })

    it('should reject article with invalid year', () => {
      const article = {
        id: 'article-1',
        title: 'Test Article',
        authors: ['Author 1'],
        year: 3000
      }

      const result = validateArticle(article)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Неверный год публикации')
    })
  })

  describe('validateGraph', () => {
    it('should validate a valid graph', () => {
      const graph = {
        id: 'graph-1',
        name: 'Test Graph',
        directed: false,
        nodes: [
          { id: 'node-1', data: { label: 'Node 1' } },
          { id: 'node-2', data: { label: 'Node 2' } }
        ],
        edges: [
          { id: 'edge-1', source: 'node-1', target: 'node-2' }
        ],
        metadata: {
          totalNodes: 2,
          totalEdges: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      const result = validateGraph(graph)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject graph without id', () => {
      const graph = {
        name: 'Test Graph',
        nodes: [],
        edges: []
      }

      const result = validateGraph(graph)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('ID графа обязателен')
    })

    it('should reject graph without nodes', () => {
      const graph = {
        id: 'graph-1',
        name: 'Test Graph',
        nodes: null as any,
        edges: []
      }

      const result = validateGraph(graph)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Узлы должны быть массивом')
    })

    it('should reject edge without source', () => {
      const graph = {
        id: 'graph-1',
        name: 'Test Graph',
        nodes: [
          { id: 'node-1', data: { label: 'Node 1' } }
        ],
        edges: [
          { id: 'edge-1', source: '', target: 'node-2' }
        ]
      }

      const result = validateGraph(graph)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('source и target обязательны'))).toBe(true)
    })
  })

  describe('validateURL', () => {
    it('should validate a valid URL', () => {
      const url = 'https://example.com/article'
      const result = validateURL(url)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject an invalid URL', () => {
      const url = 'not-a-url'
      const result = validateURL(url)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Неверный формат URL')
    })
  })

  describe('validateFileUpload', () => {
    it('should validate a valid CSV file', () => {
      const file = {
        name: 'data.csv',
        size: 1024,
        type: 'text/csv'
      }

      const result = validateFileUpload(file)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate a valid JSON file', () => {
      const file = {
        name: 'data.json',
        size: 2048,
        type: 'application/json'
      }

      const result = validateFileUpload(file)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject unsupported file format', () => {
      const file = {
        name: 'data.pdf',
        size: 1024,
        type: 'application/pdf'
      }

      const result = validateFileUpload(file)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Неподдерживаемый формат файла'))).toBe(true)
    })

    it('should reject file that is too large', () => {
      const file = {
        name: 'data.csv',
        size: 20 * 1024 * 1024,
        type: 'text/csv'
      }

      const result = validateFileUpload(file)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Размер файла превышает'))).toBe(true)
    })

    it('should reject null or undefined file', () => {
      const result = validateFileUpload(null as any)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Файл обязателен')
    })
  })

  describe('validatePubMedQuery', () => {
    it('should validate a valid query', () => {
      const query = {
        term: 'cancer immunotherapy',
        limit: 20
      }

      const result = validatePubMedQuery(query)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject query without term', () => {
      const query = {
        limit: 20
      }

      const result = validatePubMedQuery(query)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Поисковый запрос обязателен')
    })

    it('should reject query with invalid limit', () => {
      const query = {
        term: 'cancer',
        limit: 2000
      }

      const result = validatePubMedQuery(query)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Лимит должен быть числом от 1 до 1000')
    })
  })
})
