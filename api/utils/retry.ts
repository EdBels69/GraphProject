export async function withRetry<T>(
    fn: () => Promise<T>,
    options: { maxRetries: number; retryDelay: number } = { maxRetries: 3, retryDelay: 1000 },
    context: string = 'operation'
): Promise<T> {
    let lastError: any
    for (let i = 0; i < options.maxRetries; i++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error
            console.warn(`[Retry] ${context} failed (finding ${i + 1}/${options.maxRetries}): ${error}`)
            if (i < options.maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, options.retryDelay))
            }
        }
    }
    throw lastError
}
