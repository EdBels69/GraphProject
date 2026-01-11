import { v4 as uuidv4 } from 'uuid'

export interface Chunk {
  id: string
  content: string
  metadata: {
    source: string
    position: number
    tokens?: number
    entities?: string[]
    tables?: string[]
    type: 'paragraph' | 'word' | 'table' | 'formula'
  }
}

export interface ChunkingOptions {
  maxTokens: number
  overlap: number
  preserveTables: boolean
  preserveFormulas: boolean
}

export class ChunkingEngine {
  private options: ChunkingOptions

  constructor(options: Partial<ChunkingOptions> = {}) {
    this.options = {
      maxTokens: 2000,
      overlap: 200,
      preserveTables: true,
      preserveFormulas: true,
      ...options
    }
  }

  /**
   * Chunk text into semantic units (sections, paragraphs, etc.)
   */
  async chunkText(text: string, source: string): Promise<Chunk[]> {
    const chunks: Chunk[] = []
    let currentPosition = 0
    let currentSection = 'Introduction'

    // Common section headers in academic papers
    const sectionHeaders = [
      'Introduction', 'Background', 'Methods', 'Materials and Methods',
      'Results', 'Discussion', 'Conclusion', 'Summary', 'References', 'Acknowledgements'
    ]

    // Split by standard paragraphs (double newline)
    const paragraphs = text.split(/\n\s*\n/)
      .filter(p => p.trim().length > 20)

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim()

      // Check if this is a section header
      const lowerParagraph = trimmed.toLowerCase()
      const foundHeader = sectionHeaders.find(h => lowerParagraph === h.toLowerCase() || lowerParagraph.startsWith(h.toLowerCase() + '\n'))
      if (foundHeader && trimmed.length < 50) {
        currentSection = foundHeader
        continue
      }

      const paragraphTokens = trimmed.length // Improved approximation: count chars

      if (paragraphTokens > this.options.maxTokens) {
        // Split long paragraph by sentences to avoid mid-sentence breaks
        const sentences = trimmed.match(/[^.!?]+[.!?]+(?:\s|$)/g) || [trimmed]
        let chunkContent = ''
        let currentChunkLength = 0

        for (const sentence of sentences) {
          if (currentChunkLength + sentence.length > this.options.maxTokens) {
            if (chunkContent.trim()) {
              chunks.push({
                id: uuidv4(),
                content: chunkContent.trim(),
                metadata: {
                  source,
                  position: currentPosition,
                  tokens: currentChunkLength,
                  type: 'paragraph',
                  // @ts-ignore
                  section: currentSection
                }
              })
              currentPosition += currentChunkLength
            }
            chunkContent = sentence
            currentChunkLength = sentence.length
          } else {
            chunkContent += ' ' + sentence
            currentChunkLength += sentence.length
          }
        }

        if (chunkContent.trim()) {
          chunks.push({
            id: uuidv4(),
            content: chunkContent.trim(),
            metadata: {
              source,
              position: currentPosition,
              tokens: currentChunkLength,
              type: 'paragraph',
              // @ts-ignore
              section: currentSection
            }
          })
          currentPosition += currentChunkLength
        }
      } else {
        chunks.push({
          id: uuidv4(),
          content: trimmed,
          metadata: {
            source,
            position: currentPosition,
            tokens: paragraphTokens,
            type: 'paragraph',
            // @ts-ignore
            section: currentSection
          }
        })
        currentPosition += paragraphTokens + this.options.overlap
      }
    }

    return chunks
  }

  /**
   * Detect tables in text and extract them
   */
  detectTables(text: string): string[] {
    const tableRegex = /\|.*\|.*\|.*\|.*\|/g
    const matches = text.match(tableRegex)
    return matches || []
  }

  /**
   * Extract a table from text
   */
  extractTable(text: string, startLine: number): { name: string; headers: string[]; rows: string[][] } | null {
    const lines = text.split('\n')
    let table: { name: string; headers: string[]; rows: string[][] } = { name: '', headers: [], rows: [] }
    let inTable = true
    let currentRow: string[][] = []

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i].trim()

      // Check for table header
      if (line.includes('|') && !line.startsWith('-')) {
        if (table.headers.length === 0) {
          table.headers = line.split('|').filter(h => h.trim()).map(h => h.trim())
          table.name = `Table ${table.headers.length}`
        } else {
          // Table row
          const cells = line.split('|').filter(c => c.trim()).map(c => c.trim())
          if (cells.length === table.headers.length) {
            table.rows.push(cells)
          }
        }
      } else if (line.startsWith('-') || line === '') {
        // Potential separator or end of table
        if (table.rows.length > 0) {
          inTable = false
          break
        }
      }
    }

    return table.headers.length > 0 ? table : null
  }

  async chunkDocument(chunks: Chunk[]): Promise<{ chunks: Chunk[], tables: string[] }> {
    const tables: string[] = []

    for (const chunk of chunks) {
      const detectedTables = this.detectTables(chunk.content)

      for (const tableName of detectedTables) {
        if (!tables.includes(tableName)) {
          tables.push(tableName)
        }
      }
    }

    return { chunks, tables }
  }
}

export default new ChunkingEngine()
