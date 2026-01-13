
import io, { Socket } from 'socket.io-client'

class SocketService {
    private socket: Socket | null = null

    connect() {
        if (this.socket) return

        // Assuming backend is on same host or proxied via Vite
        // If separate: const URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'
        this.socket = io({
            path: '/socket.io',
            transports: ['websocket', 'polling']
        })

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket?.id)
        })

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected')
        })
    }

    joinJob(jobId: string) {
        if (!this.socket) this.connect()
        this.socket?.emit('join_job', jobId)
    }

    leaveJob(jobId: string) {
        this.socket?.emit('leave_job', jobId)
    }

    onJobProgress(callback: (data: any) => void) {
        if (!this.socket) this.connect()
        this.socket?.on('job_progress', callback)
    }

    offJobProgress(callback: (data: any) => void) {
        this.socket?.off('job_progress', callback)
    }
}

export const socketService = new SocketService()
