
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  API = 'API',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  message: string
  originalError?: unknown
  context?: Record<string, any>
  timestamp: Date
}

class ErrorHandler {
  private static instance: ErrorHandler

  private constructor() { }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  handleError(error: unknown, context?: Record<string, any>): AppError {
    const appError = this.parseError(error, context)
    this.logError(appError)
    // Removed visual notification from static utility to avoid dependency on ToastContext
    // Components should handle UI notifications via useToast
    return appError
  }

  private parseError(error: unknown, context?: Record<string, any>): AppError {
    const timestamp = new Date()

    if (error && typeof error === 'object' && 'type' in error && 'message' in error && 'timestamp' in error) {
      return error as AppError
    }

    if (error instanceof Error) {
      return {
        type: this.getErrorType(error),
        message: error.message,
        originalError: error,
        context,
        timestamp
      }
    }

    if (typeof error === 'string') {
      return {
        type: ErrorType.UNKNOWN,
        message: error,
        context,
        timestamp
      }
    }

    return {
      type: ErrorType.UNKNOWN,
      message: 'An unknown protocol termination occurred',
      originalError: error,
      context,
      timestamp
    }
  }

  private getErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK
    }

    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION
    }

    if (message.includes('unauthorized') || message.includes('401')) {
      return ErrorType.AUTHENTICATION
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return ErrorType.PERMISSION
    }

    if (message.includes('not found') || message.includes('404')) {
      return ErrorType.NOT_FOUND
    }

    if (message.includes('server') || message.includes('500')) {
      return ErrorType.SERVER
    }

    if (message.includes('api') || message.includes('http')) {
      return ErrorType.API
    }

    return ErrorType.UNKNOWN
  }

  private logError(error: AppError): void {
    console.error(`[SYSTEM_ERROR][${error.type}] ${error.message}`, {
      originalError: error.originalError,
      context: error.context,
      timestamp: error.timestamp
    })
  }

  createError(type: ErrorType, message: string, context?: Record<string, any>): AppError {
    return {
      type,
      message,
      context,
      timestamp: new Date()
    }
  }

  async handleAsync<T>(
    promise: Promise<T>,
    context?: Record<string, any>
  ): Promise<{ data?: T; error?: AppError }> {
    try {
      const data = await promise
      return { data }
    } catch (error) {
      const appError = this.handleError(error, context)
      return { error: appError }
    }
  }
}

export const errorHandler = ErrorHandler.getInstance()

export const withErrorHandling = <T extends any[]>(
  fn: (...args: T) => Promise<void>,
  context?: Record<string, any>
) => {
  return async (...args: T): Promise<void> => {
    const { error } = await errorHandler.handleAsync(fn(...args), context)
    if (error) {
      throw error
    }
  }
}
