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
   * Chunk text into semantic units (paragraphs, sections, etc.)
   */
  async chunkText(text: string, source: string): Promise<Chunk[]> {
    const chunks: Chunk[] = []
    let currentPosition = 0
    let currentSection: string[] = []
    
    // Split by paragraphs first
    const paragraphs = text.split(/\n\s*\n\s*\n/)
      .filter(p => p.trim().length > 50)
    
    for (const paragraph of paragraphs) {
      if (currentPosition + paragraph.length > this.options.maxTokens) {
        // Process paragraph if it fits
        if (currentPosition + paragraph.length <= this.options.maxTokens) {
          chunks.push({
            id: uuidv4(),
            content: paragraph.trim(),
            metadata: {
              source,
              position: currentPosition,
              tokens: paragraph.length,
              type: 'paragraph'
            }
          })
          currentPosition += paragraph.length + this.options.overlap
        } else {
          // Split paragraph into smaller chunks
          const words = paragraph.split(/\s+/)
          let chunkContent = ''
          let chunkTokens = 0
          
          for (const word of words) {
            if (chunkTokens + word.length > this.options.maxTokens) {
              chunks.push({
                id: uuidv4(),
                content: chunkContent.trim(),
                metadata: {
                  source,
                  position: currentPosition,
                  tokens: chunkTokens,
                  type: 'word'
                }
              })
              chunkContent = word + ' '
              chunkTokens = word.length
              currentPosition += word.length + this.options.overlap
            } else {
              chunkContent += word + ' '
              chunkTokens++
            }
          }
        }
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
    let table: { name: '', headers: [], rows: [] }
    let inTable = false
    let currentRow: string[] = []
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Check for table header
      if (line.includes('|') && !line.startsWith('-')) {
        if (inTable) {
          table.headers = line.split('|').map(h => h.trim())
          table.name = `Table ${table.headers.length}`
          inTable = false
        }
      } else if (inTable && line.startsWith('-')) {
        // End of table
        if (currentRow.length > 0) {
          table.rows.push([...currentRow])
          currentRow = []
        }
        inTable = false
      } else if (inTable) {
        // Table row
        const cells = line.split('|').map(c => c.trim())
        if (cells.length === table.headers.length) {
          currentRow.push(cells)
        }
      }
    }
    
    if (currentRow.length > 0) {
      table.rows.push([...currentRow])
    }
    
    return table
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
