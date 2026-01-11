
import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { logger } from '../core/Logger'

export class SocketService {
    private io: Server | null = null

    /**
     * Initialize Socket.IO instance
     */
    initialize(httpServer: HttpServer): void {
        this.io = new Server(httpServer, {
            cors: {
                origin: '*', // Allow all origins for dev simplicity, restrict in prod if needed
                methods: ['GET', 'POST']
            }
        })

        this.io.on('connection', (socket: Socket) => {
            logger.info('SocketService', `Client connected: ${socket.id}`)

            socket.on('disconnect', () => {
                logger.debug('SocketService', `Client disconnected: ${socket.id}`)
            })

            // Allow client to join specific job rooms for targeted updates
            socket.on('join_job', (jobId: string) => {
                socket.join(`job:${jobId}`)
                logger.debug('SocketService', `Client ${socket.id} joined room job:${jobId}`)
            })

            socket.on('leave_job', (jobId: string) => {
                socket.leave(`job:${jobId}`)
                logger.debug('SocketService', `Client ${socket.id} left room job:${jobId}`)
            })
        })

        logger.info('SocketService', 'Socket.IO initialized')
    }

    /**
     * Emit an event to all connected clients or specific room
     */
    emit(event: string, data: any, roomId?: string): void {
        if (!this.io) {
            logger.warn('SocketService', 'Attempted to emit event before initialization')
            return
        }

        if (roomId) {
            this.io.to(roomId).emit(event, data)
        } else {
            this.io.emit(event, data)
        }
    }

    /**
     * Emit progress update for a specific job
     */
    emitJobProgress(jobId: string, progress: number, message?: string, status?: string): void {
        this.emit('job_progress', { jobId, progress, message, status }, `job:${jobId}`)
    }
}

export const socketService = new SocketService()
