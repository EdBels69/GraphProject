declare module 'parquetjs-lite' {
    export interface ParquetSchemaDefinition {
        [key: string]: {
            type: string
            optional?: boolean
            repeated?: boolean
        }
    }

    export class ParquetSchema {
        constructor(schema: ParquetSchemaDefinition)
    }

    export interface ParquetWriterOptions {
        pageSize?: number
        rowGroupSize?: number
    }

    export class ParquetWriter {
        static openFile(schema: ParquetSchema, path: string, options?: ParquetWriterOptions): Promise<ParquetWriter>
        appendRow(row: Record<string, any>): Promise<void>
        close(): Promise<void>
    }

    export class ParquetReader {
        static openFile(path: string): Promise<ParquetReader>
        getCursor(): ParquetCursor
        close(): Promise<void>
    }

    export class ParquetCursor {
        next(): Promise<Record<string, any> | null>
    }
}
