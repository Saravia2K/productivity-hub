import { io, type Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8000'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      // Prefer WebSocket, fall back to polling for restrictive networks
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}

export function connectSocket(token: string): void {
  const s = getSocket()
  s.auth = { token }
  if (!s.connected) s.connect()
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect()
  }
}
