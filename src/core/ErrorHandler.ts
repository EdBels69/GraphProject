export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR'
}

export class AppError extends Error {
  statusCode: number;
  code: string;
  type: ErrorType;
  details?: any;
  requestId?: string;
  timestamp: string;

  constructor(statusCode: number, code: string, type: ErrorType, message: string, details?: any, requestId?: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.type = type;
    this.details = details;
    this.requestId = requestId;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      type: this.type,
      details: this.details,
      requestId: this.requestId,
      timestamp: this.timestamp,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined
    };
  }
}

export class ValidationError extends AppError {
  constructor(code: string, message: string = 'Validation failed', details?: any, requestId?: string) {
    super(400, code, ErrorType.VALIDATION_ERROR, message, details, requestId);
  }
}

export class AuthenticationError extends AppError {
  constructor(code: string, message: string = 'Authentication failed', requestId?: string) {
    super(401, code, ErrorType.AUTHENTICATION_ERROR, message, undefined, requestId);
  }
}

export class AuthorizationError extends AppError {
  constructor(code: string, message: string = 'Insufficient permissions', requestId?: string) {
    super(403, code, ErrorType.AUTHORIZATION_ERROR, message, undefined, requestId);
  }
}

export class NotFoundError extends AppError {
  constructor(code: string, message: string = 'Resource not found', requestId?: string) {
    super(404, code, ErrorType.NOT_FOUND_ERROR, message, undefined, requestId);
  }
}

export class ConflictError extends AppError {
  constructor(code: string, message: string = 'Conflict occurred', requestId?: string) {
    super(409, code, ErrorType.CONFLICT_ERROR, message, undefined, requestId);
  }
}

export class InternalError extends AppError {
  constructor(code: string, message: string = 'Internal server error', requestId?: string) {
    super(500, code, ErrorType.INTERNAL_ERROR, message, undefined, requestId);
  }
}

export class ExternalApiError extends AppError {
  constructor(code: string, message: string, statusCode: number = 502, requestId?: string) {
    super(statusCode, code, ErrorType.EXTERNAL_API_ERROR, message, undefined, requestId);
  }
}

export class DatabaseError extends AppError {
  constructor(code: string, message: string, details?: any, requestId?: string) {
    super(500, code, ErrorType.DATABASE_ERROR, message, details, requestId);
  }
}

export class NetworkError extends AppError {
  constructor(code: string, message: string, requestId?: string) {
    super(503, code, ErrorType.NETWORK_ERROR, message, undefined, requestId);
  }
}

export class RateLimitError extends AppError {
  constructor(code: string, message: string = 'Too many requests', requestId?: string) {
    super(429, code, ErrorType.RATE_LIMIT_ERROR, message, undefined, requestId);
  }
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByType: Map<ErrorType, number>;
  errorsByCode: Map<string, number>;
  recentErrors: any[];
}

export class ErrorHandler {
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByType: new Map(),
    errorsByCode: new Map(),
    recentErrors: []
  };
  private readonly MAX_RECENT_ERRORS = 100;

  handle(error: Error | AppError, requestId?: string): AppError {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
      if (requestId) appError.requestId = requestId;
    } else {
      appError = new AppError(
        500,
        'INTERNAL_SERVER_ERROR',
        ErrorType.INTERNAL_ERROR,
        error.message,
        { originalError: error.message, stack: error.stack },
        requestId
      );
    }

    this.trackError(appError);
    return appError;
  }

  private trackError(error: AppError) {
    this.metrics.totalErrors++;

    const typeCount = this.metrics.errorsByType.get(error.type) || 0;
    this.metrics.errorsByType.set(error.type, typeCount + 1);

    const codeCount = this.metrics.errorsByCode.get(error.code) || 0;
    this.metrics.errorsByCode.set(error.code, codeCount + 1);

    this.metrics.recentErrors.unshift(error.toJSON());
    if (this.metrics.recentErrors.length > this.MAX_RECENT_ERRORS) {
      this.metrics.recentErrors.pop();
    }
  }

  getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  clearMetrics() {
    this.metrics = {
      totalErrors: 0,
      errorsByType: new Map(),
      errorsByCode: new Map(),
      recentErrors: []
    };
  }

  createErrorResponse(error: any): any {
    return {
      success: false,
      error: {
        type: error.type,
        code: error.code,
        message: error.message,
        details: error.details,
        requestId: error.requestId,
        timestamp: error.timestamp
      }
    };
  }

  isOperational(error: Error): boolean {
    return error instanceof AppError;
  }
}

const errorHandler = new ErrorHandler();
export default errorHandler;
