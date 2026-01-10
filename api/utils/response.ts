import { Response } from 'express'
import { ErrorCode } from './errors'

export interface IApiResponse<T = any> {
    success: boolean
    data?: T
    error?: {
        code: ErrorCode
        message: string
        details?: any
    }
    meta?: any
}

export class ApiResponse {
    static success<T>(res: Response, data: T, statusCode: number = 200, meta?: any) {
        return res.status(statusCode).json({
            success: true,
            data,
            meta
        })
    }

    static error(res: Response, message: string, statusCode: number = 500, code: ErrorCode = ErrorCode.INTERNAL_ERROR, details?: any) {
        return res.status(statusCode).json({
            success: false,
            error: {
                code,
                message,
                details
            }
        })
    }
}
