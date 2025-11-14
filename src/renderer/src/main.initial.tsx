import { useMainStates } from './main.provider'
import React, { useEffect, useMemo } from 'react'
import { SocketEvent, socketManager } from './utils/socket'

const InitialMain: React.FC = React.memo(() => {
  const { states, updateStates } = useMainStates()
  const token = useMemo(() => states.loginInfo?.token, [states.loginInfo?.token])
  useEffect(() => {
    if (token) {
      socketManager.init(token)
    }
  }, [token])
  useEffect(() => {
    const callback = (data) =>
      updateStates((prev) => ({ ...prev, loginInfo: { ...prev.loginInfo, ...data } }))
    socketManager.on(SocketEvent.LoginInfo, callback)
    return () => {
      socketManager.off(SocketEvent.LoginInfo, callback)
    }
  }, [])
  useEffect(() => {
    const callback = (payload) => {
      console.log(payload)
      window.api.msgFromRenderToMain(SocketEvent.SendMessage, payload)
    }
    socketManager.on(SocketEvent.SendMessage, callback)
    return () => {
      socketManager.off(SocketEvent.SendMessage, callback)
    }
  }, [])
  useEffect(() => {
    window.api.msgFromMainToRender((channel: SocketEvent, payload) => {
      console.log(channel, payload)
      socketManager.emit(channel, payload)
    })
  }, [])
  return <></>
})
InitialMain.displayName = 'InitialMain'

export default InitialMain
