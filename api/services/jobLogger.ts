
/**
 * Job Logger Service
 * Handles granular logging for "Glass Box" AI transparency.
 */

export interface LogEntry {
    timestamp: string
    type: 'info' | 'search' | 'ai' | 'error' | 'success'
    message: string
}

export class JobLogger {
    private jobLogs: Map<string, LogEntry[]> = new Map()
    private maxLogsPerJob = 1000

    /**
     * Log an event for a specific job
     */
    log(jobId: string, type: LogEntry['type'], message: string): void {
        if (!this.jobLogs.has(jobId)) {
            this.jobLogs.set(jobId, [])
        }

        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            type,
            message
        }

        const logs = this.jobLogs.get(jobId)!
        logs.push(entry)

        // Cap logs size
        if (logs.length > this.maxLogsPerJob) {
            logs.shift()
        }
    }

    /**
     * Get all logs for a job
     */
    getLogs(jobId: string): LogEntry[] {
        return this.jobLogs.get(jobId) || []
    }

    /**
     * Clear logs for a job (e.g. on delete)
     */
    clearLogs(jobId: string): void {
        this.jobLogs.delete(jobId)
    }
}

export const jobLogger = new JobLogger()
export default jobLogger
