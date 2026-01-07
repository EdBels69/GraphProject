export interface RetryConfig {
  maxRetries: number
  retryDelay: number
  onRetry?: (attempt: number, error: Error) => void
  onMaxRetriesReached?: () => void
  persistContext?: boolean
}

export interface RetryState {
  isRetrying: boolean
  currentAttempt: number
  totalRetries: number
  nextRetryTime: Date | null
  lastError: Error | null
  startTime: Date
}

export interface RetryLogEntry {
  timestamp: Date
  attempt: number
  success: boolean
  error?: string
  duration: number
}

const RETRY_STORAGE_KEY = 'graph-analyser-retry-state'

export class RetryHandler {
  private config: Required<RetryConfig>
  private state: RetryState
  private logs: RetryLogEntry[] = []
  private abortController: AbortController | null = null

  constructor(config: RetryConfig) {
    this.config = {
      maxRetries: 20,
      retryDelay: 15000,
      onRetry: () => {},
      onMaxRetriesReached: () => {},
      persistContext: true,
      ...config
    }

    this.state = this.loadState()
    this.logs = this.loadLogs()
  }

  private loadState(): RetryState {
    if (this.config.persistContext) {
      try {
        const stored = localStorage.getItem(RETRY_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.nextRetryTime && new Date(parsed.nextRetryTime) > new Date()) {
            return {
              ...parsed,
              nextRetryTime: new Date(parsed.nextRetryTime),
              startTime: new Date(parsed.startTime)
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load retry state:', error)
      }
    }

    return {
      isRetrying: false,
      currentAttempt: 0,
      totalRetries: 0,
      nextRetryTime: null,
      lastError: null,
      startTime: new Date()
    }
  }

  private saveState(): void {
    if (this.config.persistContext) {
      try {
        localStorage.setItem(RETRY_STORAGE_KEY, JSON.stringify({
          ...this.state,
          nextRetryTime: this.state.nextRetryTime?.toISOString(),
          startTime: this.state.startTime.toISOString()
        }))
      } catch (error) {
        console.warn('Failed to save retry state:', error)
      }
    }
  }

  private loadLogs(): RetryLogEntry[] {
    try {
      const stored = localStorage.getItem(`${RETRY_STORAGE_KEY}-logs`)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Failed to load retry logs:', error)
      return []
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem(`${RETRY_STORAGE_KEY}-logs`, JSON.stringify(this.logs))
    } catch (error) {
      console.warn('Failed to save retry logs:', error)
    }
  }

  private logAttempt(attempt: number, success: boolean, error?: Error, duration: number): void {
    const logEntry: RetryLogEntry = {
      timestamp: new Date(),
      attempt,
      success,
      error: error?.message,
      duration
    }

    this.logs.push(logEntry)
    this.saveLogs()

    console.log(`[Retry Handler] Attempt ${attempt}: ${success ? 'SUCCESS' : 'FAILED'}`, logEntry)
  }

  public async execute<T>(
    task: () => Promise<T>,
    taskId: string
  ): Promise<T> {
    if (this.state.isRetrying) {
      throw new Error('Another retry is in progress')
    }

    this.state = {
      isRetrying: true,
      currentAttempt: 1,
      totalRetries: 0,
      nextRetryTime: null,
      lastError: null,
      startTime: new Date()
    }
    this.saveState()

    return this.retryLoop(task, taskId)
  }

  private async retryLoop<T>(
    task: () => Promise<T>,
    taskId: string
  ): Promise<T> {
    this.abortController = new AbortController()

    while (this.state.currentAttempt <= this.config.maxRetries) {
      const attemptStartTime = Date.now()

      try {
        console.log(`[Retry Handler] Attempt ${this.state.currentAttempt}/${this.config.maxRetries} for task: ${taskId}`)

        const result = await task()

        const duration = Date.now() - attemptStartTime
        this.logAttempt(this.state.currentAttempt, true, undefined, duration)

        this.resetState()
        return result

      } catch (error) {
        const duration = Date.now() - attemptStartTime
        const errorObj = error instanceof Error ? error : new Error(String(error))
        
        this.state.lastError = errorObj
        this.state.totalRetries++
        this.saveState()
        
        this.logAttempt(this.state.currentAttempt, false, errorObj, duration)

        if (this.state.currentAttempt >= this.config.maxRetries) {
          console.error(`[Retry Handler] Max retries (${this.config.maxRetries}) reached for task: ${taskId}`)
          this.config.onMaxRetriesReached()
          this.resetState()
          throw new Error(`Maximum retry attempts (${this.config.maxRetries}) reached. Last error: ${errorObj.message}`)
        }

        if (this.abortController?.signal.aborted) {
          console.log(`[Retry Handler] Retry aborted for task: ${taskId}`)
          this.resetState()
          throw new Error('Retry aborted by user')
        }

        this.state.currentAttempt++
        this.state.nextRetryTime = new Date(Date.now() + this.config.retryDelay)
        this.saveState()

        this.config.onRetry(this.state.currentAttempt, errorObj)

        console.log(`[Retry Handler] Waiting ${this.config.retryDelay}ms before next attempt...`)

        await this.delay(this.config.retryDelay)
      }
    }

    throw new Error('Unexpected exit from retry loop')
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public getState(): RetryState {
    return { ...this.state }
  }

  public getLogs(): RetryLogEntry[] {
    return [...this.logs]
  }

  public clearLogs(): void {
    this.logs = []
    this.saveLogs()
    console.log('[Retry Handler] Logs cleared')
  }

  public resetState(): void {
    this.state = {
      isRetrying: false,
      currentAttempt: 0,
      totalRetries: 0,
      nextRetryTime: null,
      lastError: null,
      startTime: new Date()
    }
    this.saveState()
  }

  public abort(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
      console.log('[Retry Handler] Retry aborted')
      this.resetState()
    }
  }

  public async resume(): Promise<void> {
    if (this.state.nextRetryTime && new Date() < this.state.nextRetryTime) {
      const waitTime = this.state.nextRetryTime.getTime() - Date.now()
      console.log(`[Retry Handler] Resuming with ${waitTime}ms delay`)
      await this.delay(waitTime)
    }
  }

  public getRemainingRetries(): number {
    return this.config.maxRetries - this.state.currentAttempt
  }

  public getTimeUntilNextRetry(): number | null {
    if (!this.state.nextRetryTime) {
      return null
    }
    const remaining = this.state.nextRetryTime.getTime() - Date.now()
    return remaining > 0 ? remaining : 0
  }
}

export function createRetryHandler(config: RetryConfig): RetryHandler {
  return new RetryHandler(config)
}

export async function withRetry<T>(
  task: () => Promise<T>,
  config?: Partial<RetryConfig>,
  taskId?: string
): Promise<T> {
  const handler = createRetryHandler(config || {})
  return handler.execute(task, taskId || `task-${Date.now()}`)
}