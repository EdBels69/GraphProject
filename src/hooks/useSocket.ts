
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

// Initialize socket outside component to maintain single connection
// In a real app, environment variable should be used for URL
const SOCKET_URL = 'http://localhost:3002'

let socket: Socket | null = null

export const getSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'], // fallback
            autoConnect: true,
            reconnectionAttempts: 5
        })
    }
    return socket
}

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(socket?.connected || false)
    const socketInstance = getSocket()

    useEffect(() => {
        const onConnect = () => setIsConnected(true)
        const onDisconnect = () => setIsConnected(false)

        socketInstance.on('connect', onConnect)
        socketInstance.on('disconnect', onDisconnect)

        return () => {
            socketInstance.off('connect', onConnect)
            socketInstance.off('disconnect', onDisconnect)
        }
    }, [])

    const joinJob = (jobId: string) => {
        socketInstance.emit('join_job', jobId)
    }

    const leaveJob = (jobId: string) => {
        socketInstance.emit('leave_job', jobId)
    }

    return {
        socket: socketInstance,
        isConnected,
        joinJob,
        leaveJob
    }
}
