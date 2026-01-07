import { toast } from 'sonner'

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

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  handleError(error: unknown, context?: Record<string, any>): AppError {
    const appError = this.parseError(error, context)
    this.logError(appError)
    this.notifyUser(appError)
    return appError
  }

  private parseError(error: unknown, context?: Record<string, any>): AppError {
    const timestamp = new Date()

    if (error instanceof AppError) {
      return error
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
      message: 'Произошла неизвестная ошибка',
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
    console.error(`[${error.type}] ${error.message}`, {
      originalError: error.originalError,
      context: error.context,
      timestamp: error.timestamp
    })
  }

  private notifyUser(error: AppError): void {
    const userMessage = this.getUserMessage(error)

    switch (error.type) {
      case ErrorType.NETWORK:
        toast.error(userMessage, {
          description: 'Проверьте подключение к интернету и попробуйте снова'
        })
        break

      case ErrorType.VALIDATION:
        toast.error(userMessage, {
          description: 'Проверьте введенные данные'
        })
        break

      case ErrorType.AUTHENTICATION:
        toast.error(userMessage, {
          description: 'Войдите в систему для продолжения'
        })
        break

      case ErrorType.PERMISSION:
        toast.error(userMessage, {
          description: 'У вас нет прав для выполнения этого действия'
        })
        break

      case ErrorType.NOT_FOUND:
        toast.error(userMessage, {
          description: 'Запрошенный ресурс не найден'
        })
        break

      case ErrorType.SERVER:
        toast.error(userMessage, {
          description: 'Произошла ошибка на сервере. Попробуйте позже'
        })
        break

      case ErrorType.API:
        toast.error(userMessage, {
          description: 'Не удалось выполнить запрос к API'
        })
        break

      default:
        toast.error(userMessage)
    }
  }

  private getUserMessage(error: AppError): string {
    const typeMessages: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: 'Ошибка сети',
      [ErrorType.VALIDATION]: 'Ошибка валидации',
      [ErrorType.API]: 'Ошибка API',
      [ErrorType.AUTHENTICATION]: 'Ошибка авторизации',
      [ErrorType.PERMISSION]: 'Ошибка доступа',
      [ErrorType.NOT_FOUND]: 'Ресурс не найден',
      [ErrorType.SERVER]: 'Ошибка сервера',
      [ErrorType.UNKNOWN]: 'Произошла ошибка'
    }

    return typeMessages[error.type] || error.message
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
