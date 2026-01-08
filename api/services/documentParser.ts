import mammoth from 'mammoth'
import pdf from 'pdf-parse'

export interface ParsedDocument {
  id: string
  title: string
  content: string
  tables: Array<{ name: string; headers: string[]; rows: string[][] }>
  metadata: {
    fileName: string
    fileType: 'pdf' | 'docx' | 'txt'
    pageCount: number
    extractedAt: Date
  }
}

export interface ParsedTable {
  name: string
  headers: string[]
  rows: string[][]
  metadata: {
    caption?: string
    rowCount: number
  }
}

export class DocumentParser {
  async parsePDF(buffer: Buffer, originalname: string = ''): Promise<ParsedDocument> {
    try {
      const data = await pdf(buffer)
      const text = data.text || ''
      const pageCount = data.numpages || 0

      const tables = this.extractTables(text)

      const info = data.info as any;
      return {
        id: `doc-${Date.now()}`,
        title: info?.Title || originalname || `Document ${Date.now()}`,
        content: text,
        tables,
        metadata: {
          fileName: originalname,
          fileType: 'pdf',
          pageCount,
          extractedAt: new Date()
        }
      }
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async parseDOCX(buffer: Buffer, originalname: string = ''): Promise<ParsedDocument> {
    try {
      const result = await mammoth.extractRawText({ buffer })
      const text = result.value || ''

      const tables = this.extractTables(text)

      return {
        id: `doc-${Date.now()}`,
        title: originalname || `Document ${Date.now()}`,
        content: text,
        tables,
        metadata: {
          fileName: originalname,
          fileType: 'docx',
          pageCount: Math.ceil((text.length || 0) / 2000), // Estimate pages
          extractedAt: new Date()
        }
      }
    } catch (error) {
      throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async parseText(text: string, fileName: string): Promise<ParsedDocument> {
    try {
      const tables = this.extractTables(text)

      // Extract title from first line if available
      const lines = text.split('\n')
      const title = lines[0]?.trim() || fileName || `Document ${Date.now()}`

      return {
        id: `doc-${Date.now()}`,
        title,
        content: text,
        tables,
        metadata: {
          fileName,
          fileType: 'txt',
          pageCount: Math.ceil(text.length / 2000), // Estimate pages
          extractedAt: new Date()
        }
      }
    } catch (error) {
      throw new Error(`Failed to parse text: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  private extractTables(text: string): ParsedTable[] {
    const tables: ParsedTable[] = []
    const lines = text.split('\n')
    let currentTable: ParsedTable | null = null
    let currentHeaders: string[] = []
    let currentRows: string[][] = []
    let rowCount = 0

    for (const line of lines) {
      const trimmedLine = line.trim()

      // Check for table headers (cells with | separator)
      if (trimmedLine.includes('|') && !trimmedLine.startsWith('-')) {
        const headers = trimmedLine.split('|').map(h => h.trim()).filter(h => h)
        if (headers.length > 1) {
          currentTable = {
            name: `Table ${tables.length + 1}`,
            headers,
            rows: [],
            metadata: { rowCount: 0 }
          }
          tables.push(currentTable)
          currentHeaders = headers
          currentRows = []
          rowCount = 0
          continue
        }
      }

      // Check for table row separator (cells with |)
      if (currentTable && trimmedLine.includes('|') && !trimmedLine.startsWith('-')) {
        const cells = trimmedLine.split('|').map(c => c.trim()).filter(c => c)
        if (cells.length === currentHeaders.length) {
          currentRows.push(cells)
          rowCount++
          currentTable.rows = currentRows
          currentTable.metadata.rowCount = rowCount
        }
      }

      // Check for horizontal rule (---)
      if (trimmedLine === '---' || trimmedLine.startsWith('---')) {
        if (currentTable) {
          const lineIndex = lines.indexOf(line)
          if (lineIndex + 1 < lines.length) {
            currentTable.metadata.caption = lines[lineIndex + 1]?.trim()
          }
        }
      }
    }

    return tables
  }

  async parseFromURL(url: string): Promise<ParsedDocument> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status}`)
      }

      const contentType = response.headers.get('content-type') || ''
      const arrayBuffer = await response.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const fileName = url.split('/').pop() || 'document'
      if (contentType.includes('pdf')) {
        return this.parsePDF(buffer, fileName)
      } else if (contentType.includes('officedocument') || contentType.includes('wordprocessingml')) {
        return this.parseDOCX(buffer, fileName)
      } else if (contentType.includes('text/plain')) {
        const text = await response.text()
        return this.parseText(text, fileName)
      } else {
        throw new Error(`Unsupported content type: ${contentType}`)
      }
    } catch (error) {
      throw new Error(`Failed to parse from URL: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

export default new DocumentParser()
