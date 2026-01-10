import {
  ErrorHandler,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  InternalError,
  ExternalApiError,
  DatabaseError,
  NetworkError,
  RateLimitError,
  ErrorType
} from './ErrorHandler';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  describe('error classes', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('VALIDATION_CODE', 'Invalid input', { field: 'email' });

      expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(error.code).toBe('VALIDATION_CODE');
      expect(error.message).toBe('Invalid input');
      expect(error.details).toEqual({ field: 'email' });
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should create AuthenticationError with correct properties', () => {
      const error = new AuthenticationError('AUTH_CODE', 'Unauthorized');

      expect(error.type).toBe(ErrorType.AUTHENTICATION_ERROR);
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should create AuthorizationError with correct properties', () => {
      const error = new AuthorizationError('AUTHZ_CODE', 'Forbidden');

      expect(error.type).toBe(ErrorType.AUTHORIZATION_ERROR);
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });

    it('should create NotFoundError with correct properties', () => {
      const error = new NotFoundError('NOT_FOUND_CODE', 'Resource not found');

      expect(error.type).toBe(ErrorType.NOT_FOUND_ERROR);
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should create ConflictError with correct properties', () => {
      const error = new ConflictError('CONFLICT_CODE', 'Resource already exists');

      expect(error.type).toBe(ErrorType.CONFLICT_ERROR);
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });

    it('should create InternalError with correct properties', () => {
      const error = new InternalError('INTERNAL_CODE', 'Server error');

      expect(error.type).toBe(ErrorType.INTERNAL_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('InternalError');
    });

    it('should create ExternalApiError with custom status code', () => {
      const error = new ExternalApiError('API_CODE', 'External service error', 502);

      expect(error.type).toBe(ErrorType.EXTERNAL_API_ERROR);
      expect(error.statusCode).toBe(502);
      expect(error.name).toBe('ExternalApiError');
    });

    it('should create DatabaseError with correct properties', () => {
      const error = new DatabaseError('DB_CODE', 'Database error');

      expect(error.type).toBe(ErrorType.DATABASE_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('DatabaseError');
    });

    it('should create NetworkError with correct properties', () => {
      const error = new NetworkError('NETWORK_CODE', 'Network error');

      expect(error.type).toBe(ErrorType.NETWORK_ERROR);
      expect(error.statusCode).toBe(503);
      expect(error.name).toBe('NetworkError');
    });

    it('should create RateLimitError with correct properties', () => {
      const error = new RateLimitError('RATE_LIMIT_CODE', 'Too many requests');

      expect(error.type).toBe(ErrorType.RATE_LIMIT_ERROR);
      expect(error.statusCode).toBe(429);
      expect(error.name).toBe('RateLimitError');
    });
  });

  describe('error serialization', () => {
    it('should serialize ApplicationError to JSON', () => {
      const error = new ValidationError('CODE', 'Message', { details: 'test' }, 'req123');
      const json = error.toJSON();

      expect(json.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(json.code).toBe('CODE');
      expect(json.message).toBe('Message');
      expect(json.details).toEqual({ details: 'test' });
      expect(json.statusCode).toBe(400);
      expect(json.requestId).toBe('req123');
      expect(json.timestamp).toBeDefined();
    });

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new InternalError('CODE', 'Error');
      const json = error.toJSON();

      expect(json.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new InternalError('CODE', 'Error');
      const json = error.toJSON();

      expect(json.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('handle method', () => {
    it('should handle ApplicationError correctly', () => {
      const appError = new ValidationError('CODE', 'Message');
      const result = errorHandler.handle(appError);

      expect(result.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(result.code).toBe('CODE');
      expect(result.message).toBe('Message');
    });

    it('should wrap generic Error in InternalError', () => {
      const genericError = new Error('Generic error');
      const result = errorHandler.handle(genericError, 'req123');

      expect(result.type).toBe(ErrorType.INTERNAL_ERROR);
      expect(result.code).toBe('INTERNAL_SERVER_ERROR');
      expect(result.message).toBe('Generic error');
      expect(result.requestId).toBe('req123');
      expect(result.details).toEqual({
        originalError: 'Generic error',
        stack: genericError.stack
      });
    });

    it('should include requestId in result', () => {
      const error = new ValidationError('CODE', 'Message');
      const result = errorHandler.handle(error, 'req456');

      expect(result.requestId).toBe('req456');
    });
  });

  describe('metrics', () => {
    beforeEach(() => {
      errorHandler = new ErrorHandler();
    });

    it('should track total errors', () => {
      errorHandler.handle(new ValidationError('CODE1', 'Message 1'));
      errorHandler.handle(new ValidationError('CODE2', 'Message 2'));

      const metrics = errorHandler.getMetrics();
      expect(metrics.totalErrors).toBe(2);
    });

    it('should track errors by type', () => {
      errorHandler.handle(new ValidationError('CODE1', 'Message'));
      errorHandler.handle(new AuthenticationError('CODE2', 'Message'));
      errorHandler.handle(new ValidationError('CODE3', 'Message'));

      const metrics = errorHandler.getMetrics();
      expect(metrics.errorsByType.get(ErrorType.VALIDATION_ERROR)).toBe(2);
      expect(metrics.errorsByType.get(ErrorType.AUTHENTICATION_ERROR)).toBe(1);
    });

    it('should track errors by code', () => {
      errorHandler.handle(new ValidationError('CODE1', 'Message 1'));
      errorHandler.handle(new ValidationError('CODE1', 'Message 2'));
      errorHandler.handle(new ValidationError('CODE2', 'Message'));

      const metrics = errorHandler.getMetrics();
      expect(metrics.errorsByCode.get('CODE1')).toBe(2);
      expect(metrics.errorsByCode.get('CODE2')).toBe(1);
    });

    it('should store recent errors', () => {
      errorHandler.handle(new ValidationError('CODE1', 'Message 1'));
      errorHandler.handle(new ValidationError('CODE2', 'Message 2'));

      const metrics = errorHandler.getMetrics();
      expect(metrics.recentErrors).toHaveLength(2);
      expect(metrics.recentErrors[0].code).toBe('CODE2');
      expect(metrics.recentErrors[1].code).toBe('CODE1');
    });

    it('should limit recent errors to max size', () => {
      for (let i = 0; i < 150; i++) {
        errorHandler.handle(new ValidationError(`CODE${i}`, `Message ${i}`));
      }

      const metrics = errorHandler.getMetrics();
      expect(metrics.recentErrors.length).toBe(100);
    });

    it('should clear metrics', () => {
      errorHandler.handle(new ValidationError('CODE1', 'Message'));
      errorHandler.clearMetrics();

      const metrics = errorHandler.getMetrics();
      expect(metrics.totalErrors).toBe(0);
      expect(metrics.errorsByType.size).toBe(0);
      expect(metrics.errorsByCode.size).toBe(0);
      expect(metrics.recentErrors).toHaveLength(0);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response in correct format', () => {
      const error = new ValidationError('CODE', 'Message', { field: 'email' }, 'req123');
      const response = errorHandler.createErrorResponse(error.toJSON());

      expect(response.success).toBe(false);
      expect(response.error.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(response.error.code).toBe('CODE');
      expect(response.error.message).toBe('Message');
      expect(response.error.details).toEqual({ field: 'email' });
      expect(response.error.requestId).toBe('req123');
    });
  });
});
