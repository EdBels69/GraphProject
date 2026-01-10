import { describe, it, expect } from 'vitest'
import { parseFile, buildGraphFromParsedData, ParsedData } from './fileParser'

describe('fileParser', () => {
  describe('parseFile', () => {
    it('should parse JSON file', async () => {
      const articles = [
        {
          id: 'article-1',
          title: 'Test Article 1',
          authors: ['Author 1'],
          year: 2023,
          abstract: 'Test abstract',
          keywords: ['test'],
          citations: []
        },
        {
          id: 'article-2',
          title: 'Test Article 2',
          authors: ['Author 2'],
          year: 2024,
          citations: ['article-1']
        }
      ]

      const file = new File(
        [JSON.stringify(articles)],
        'test.json',
        { type: 'application/json' }
      )

      const result = await parseFile(file)

      expect(result.articles).toHaveLength(2)
      expect(result.articles[0].id).toBe('article-1')
      expect(result.articles[1].id).toBe('article-2')
      expect(result.citations).toHaveLength(1)
      expect(result.citations[0]).toEqual({ from: 'article-2', to: 'article-1' })
    })

    it('should parse CSV file', async () => {
      const csvContent = `id,title,authors,year,abstract,keywords,citations
article-1,"Test Article 1","Author 1",2023,"Test abstract","test",""
article-2,"Test Article 2","Author 2",2024,"Test abstract 2","test","article-1"`

      const file = new File([csvContent], 'test.csv', { type: 'text/csv' })

      const result = await parseFile(file)

      expect(result.articles).toHaveLength(2)
      expect(result.articles[0].title).toBe('Test Article 1')
      expect(result.articles[1].title).toBe('Test Article 2')
    })

    it('should parse BibTeX file', async () => {
      const bibtexContent = `@article{article1,
  title = {Test Article 1},
  author = {Author 1 and Author 2},
  year = {2023},
  abstract = {Test abstract},
  keywords = {test, sample}
}

@article{article2,
  title = {Test Article 2},
  author = {Author 3},
  year = {2024}
}`

      const file = new File([bibtexContent], 'test.bib', { type: 'text/plain' })

      const result = await parseFile(file)

      expect(result.articles).toHaveLength(2)
      expect(result.articles[0].title).toBe('Test Article 1')
      expect(result.articles[1].title).toBe('Test Article 2')
    })

    it('should throw error for unsupported file format', async () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })

      await expect(parseFile(file)).rejects.toThrow('Unsupported file format')
    })

    it('should throw error for malformed JSON', async () => {
      const file = new File(['{invalid json}'], 'test.json', { type: 'application/json' })

      await expect(parseFile(file)).rejects.toThrow('JSON parse error')
    })

    it('should throw error for empty CSV', async () => {
      const file = new File([''], 'test.csv', { type: 'text/csv' })

      await expect(parseFile(file)).rejects.toThrow('CSV file must contain')
    })
  })

  describe('buildGraphFromParsedData', () => {
    it('should build graph from parsed data', () => {
      const data: ParsedData = {
        articles: [
          {
            id: 'article-1',
            title: 'Test Article 1',
            authors: ['Author 1'],
            year: 2023,
            abstract: '',
            keywords: [],
            citations: ['article-2'],
            doi: '',
            url: '',
            published: false
          },
          {
            id: 'article-2',
            title: 'Test Article 2',
            authors: ['Author 2'],
            year: 2024,
            abstract: '',
            keywords: [],
            citations: [],
            doi: '',
            url: '',
            published: false
          }
        ],
        citations: [
          { from: 'article-1', to: 'article-2' }
        ]
      }

      const graph = buildGraphFromParsedData(data)

      expect(graph.nodes).toHaveLength(2)
      expect(graph.edges).toHaveLength(1)
      expect(graph.nodes[0].id).toBe('article-1')
      expect(graph.edges[0].source).toBe('article-1')
      expect(graph.edges[0].target).toBe('article-2')
    })

    it('should generate IDs for articles without IDs', () => {
      const data: ParsedData = {
        articles: [
          {
            id: '',
            title: 'Test Article',
            authors: [],
            year: 2023,
            abstract: '',
            keywords: [],
            citations: [],
            doi: '',
            url: '',
            published: false
          }
        ],
        citations: []
      }

      const graph = buildGraphFromParsedData(data)

      expect(graph.nodes[0].id).toBeDefined()
      expect(graph.nodes[0].id).toMatch(/^article_\d+$/)
    })

    it('should handle empty citations', () => {
      const data: ParsedData = {
        articles: [
          {
            id: 'article-1',
            title: 'Test Article',
            authors: [],
            year: 2023,
            abstract: '',
            keywords: [],
            citations: [],
            doi: '',
            url: '',
            published: false
          }
        ],
        citations: []
      }

      const graph = buildGraphFromParsedData(data)

      expect(graph.nodes).toHaveLength(1)
      expect(graph.edges).toHaveLength(0)
    })
  })
})
