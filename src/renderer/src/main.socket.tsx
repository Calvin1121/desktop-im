/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { io, Socket } from 'socket.io-client'
import { useMainStates } from './main.provider'

export enum SocketEvent {
  LoginInfo = 'loginInfo'
}

const SOCKET_URL = 'ws://localhost:4000'

interface ISocketContext {
  socket: Socket | null
  connected: boolean
  emit: (event: SocketEvent, data?: any) => void
  on: (event: SocketEvent, callback: (data: any) => void) => void
  off: (event: SocketEvent, callback?: (data: any) => void) => void
}

const SocketContext = createContext<ISocketContext>({
  socket: null,
  connected: false,
  emit: () => {},
  on: () => {},
  off: () => {}
})

export function SocketProvider({ children }: { children: ReactNode }) {
  const { states } = useMainStates()
  const token = useMemo(() => states.loginInfo?.token, [states.loginInfo?.token])

  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  const connect = useCallback(() => {
    if (!token) return

    const s = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { token }
    })

    s.on('connect', () => {
      console.log('[socket] connected')
      setConnected(true)
    })

    s.on('disconnect', (reason) => {
      console.warn('[socket] disconnected:', reason)
      setConnected(false)
    })

    s.on('connect_error', (err) => {
      console.error('[socket] connect error:', err.message)
    })

    s.on('reconnect_attempt', (attempt) => console.log('[socket] reconnect attempt', attempt))
    s.on('reconnect_failed', () => console.error('[socket] reconnect failed'))

    setSocket(s)
    return s
  }, [token])

  useEffect(() => {
    if (!token) {
      socket?.disconnect()
      setSocket(null)
      setConnected(false)
      return
    }

    const s = connect()
    return () => {
      s?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, connect])

  // 封装发送、订阅、取消订阅
  const emit = useCallback(
    (event: SocketEvent, data?: any) => {
      if (socket && connected) socket.emit(event, data)
    },
    [socket, connected]
  )

  const on = useCallback(
    (event: SocketEvent, callback: (data: any) => void) => {
      if (socket) socket.on(event, callback)
    },
    [socket]
  )

  const off = useCallback(
    (event: SocketEvent, callback?: (data: any) => void) => {
      if (socket) socket.off(event, callback)
    },
    [socket]
  )

  const value = useMemo(
    () => ({ socket, connected, emit, on, off }),
    [socket, connected, emit, on, off]
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useAppSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useAppSocket 必须在 <SocketProvider> 内使用')
  }
  return context
}
