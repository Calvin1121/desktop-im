// socket.manager.ts
import { io, Socket } from 'socket.io-client'

export enum SocketEvent {
  LoginInfo = 'loginInfo',
  SendMessage = 'sendMessage'
}

class SocketManager {
  private static instance: SocketManager
  private socket: Socket | null = null
  private token: string | null = null
  private connected = false

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static getInstance() {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  init(token: string) {
    if (this.socket) {
      console.warn('[socket] already initialized')
      return
    }

    this.token = token

    this.socket = io('ws://localhost:4000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token }
    })

    this.socket.on('connect', () => {
      console.log('[socket] connected')
      this.connected = true
    })

    this.socket.on('disconnect', (reason) => {
      console.warn('[socket] disconnected:', reason)
      this.connected = false
    })

    this.socket.on('connect_error', (err) => {
      console.error('[socket] connect error:', err.message)
    })
  }

  destroy() {
    this.socket?.disconnect()
    this.socket = null
    this.connected = false
  }

  // ====== 公共方法 ======

  emit(event: SocketEvent, data?: any) {
    if (!this.socket) return
    if (!this.connected) {
      console.warn(`[socket] not connected, skip emit ${event}`)
      return
    }
    this.socket.emit(event, data)
  }

  on<T = any>(event: SocketEvent, callback: (data: T) => void) {
    if (!this.socket) return

    // 确保不重复注册，先移除再注册
    this.socket.off(event, callback)
    this.socket.on(event, callback)
  }

  off<T = any>(event: SocketEvent, callback?: (data: T) => void) {
    this.socket?.off(event, callback)
  }

  isConnected() {
    return this.connected
  }
}

// 导出单例
export const socketManager = SocketManager.getInstance()
