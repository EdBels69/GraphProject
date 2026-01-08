export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(errors: string[]) {
    super(400, 'VALIDATION_ERROR', 'Validation failed', { errors });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      404,
      'NOT_FOUND',
      `${resource}${id ? ` with id ${id}` : ''} not found`
    );
  }
}

export class DatabaseError extends AppError {
  constructor(code: string, message: string, details?: any) {
    super(500, code, message, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, 'AUTH_ERROR', message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, 'AUTHORIZATION_ERROR', message);
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests. Please try again later.');
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, details?: any) {
    super(502, 'EXTERNAL_SERVICE_ERROR', `Failed to communicate with ${service}`, details);
  }
}

export class ErrorHandler {
  handle(error: Error | AppError, requestId?: string): AppError {
    if (error instanceof AppError) {
      return error;
    }

    console.error('[ErrorHandler]', {
      requestId,
      error: error.message,
      stack: error.stack
    });

    return new AppError(
      500,
      'INTERNAL_ERROR',
      'An unexpected error occurred',
      { originalError: error.message }
    );
  }

  createErrorResponse(error: AppError): any {
    const response: any = {
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    };

    if (error.details) {
      response.error.details = error.details;
    }

    if (process.env.NODE_ENV === 'development') {
      response.error.stack = error.stack;
    }

    return response;
  }

  isOperational(error: Error): boolean {
    if (error instanceof AppError) {
      return true;
    }
    return false;
  }
}

const errorHandler = new ErrorHandler();

export default errorHandler;
