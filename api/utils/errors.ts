export enum ErrorCode {
    BAD_REQUEST = 'BAD_REQUEST',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    CONFLICT = 'CONFLICT',
}

export class AppError extends Error {
    public readonly statusCode: number
    public readonly errorCode: ErrorCode
    public readonly isOperational: boolean

    constructor(
        message: string,
        statusCode: number = 500,
        errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR,
        isOperational: boolean = true
    ) {
        super(message)
        this.statusCode = statusCode
        this.errorCode = errorCode
        this.isOperational = isOperational

        Error.captureStackTrace(this, this.constructor)
    }

    static badRequest(message: string) {
        return new AppError(message, 400, ErrorCode.BAD_REQUEST)
    }

    static unauthorized(message: string) {
        return new AppError(message, 401, ErrorCode.UNAUTHORIZED)
    }

    static forbidden(message: string) {
        return new AppError(message, 403, ErrorCode.FORBIDDEN)
    }

    static notFound(message: string) {
        return new AppError(message, 404, ErrorCode.NOT_FOUND)
    }

    static validation(message: string) {
        return new AppError(message, 422, ErrorCode.VALIDATION_ERROR)
    }

    static conflict(message: string) {
        return new AppError(message, 409, ErrorCode.CONFLICT)
    }

    static internal(message: string = 'Internal Server Error') {
        return new AppError(message, 500, ErrorCode.INTERNAL_ERROR)
    }
}
