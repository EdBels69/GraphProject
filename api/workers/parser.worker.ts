
import mammoth from 'mammoth'
import pdf from 'pdf-parse'

/**
 * Worker thread for CPU-intensive document parsing
 */
export default async function parseDocument(task: { buffer: Uint8Array | Buffer; type: 'pdf' | 'docx' }) {
    const { buffer, type } = task

    // Ensure buffer is a Buffer (piscina transfer might convert to Uint8Array)
    const buf = Buffer.from(buffer)

    try {
        if (type === 'pdf') {
            const data = await pdf(buf)
            return {
                text: data.text || '',
                pageCount: data.numpages || 0,
                info: data.info
            }
        } else if (type === 'docx') {
            const result = await mammoth.extractRawText({ buffer: buf })
            return {
                text: result.value || '',
                pageCount: Math.ceil((result.value?.length || 0) / 2000)
            }
        } else {
            throw new Error(`Unsupported type for worker: ${type}`)
        }
    } catch (error) {
        throw new Error(`Worker failed to parse ${type}: ${error instanceof Error ? error.message : String(error)}`)
    }
}
