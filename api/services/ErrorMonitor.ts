
import { logger } from '../../core/Logger'

export class ErrorMonitor {
    private static instance: ErrorMonitor

    private constructor() { }

    static getInstance(): ErrorMonitor {
        if (!ErrorMonitor.instance) {
            ErrorMonitor.instance = new ErrorMonitor()
        }
        return ErrorMonitor.instance
    }

    /**
     * Capture an exception and log it (or send to Sentry)
     */
    captureException(error: Error | any, context?: Record<string, any>) {
        // In local/docker dev, just log structurally
        logger.error('ErrorMonitor', error.message || 'Unknown Error', {
            stack: error.stack,
            ...context
        })

        // Placeholder for Sentry integration
        // if (process.env.SENTRY_DSN) {
        //     Sentry.captureException(error, { extra: context })
        // }
    }
}

export const errorMonitor = ErrorMonitor.getInstance()
