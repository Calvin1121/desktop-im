import toast, { Toaster } from 'react-hot-toast'
import { useMainStates } from './main.provider'
import { useEffect, useMemo } from 'react'
import _ from 'lodash'
import { SocketEvent, useAppSocket } from './main.socket'
import { useUnmount } from 'react-use'

export const InitialMain = () => {
  const { states, onToast, updateStates } = useMainStates()
  const { on, off, emit } = useAppSocket()
  useEffect(() => {
    on(SocketEvent.LoginInfo, (data) => {
      updateStates((prev) => ({ ...prev, loginInfo: { ...prev.loginInfo, ...data } }))
    })
    on(SocketEvent.SendMessage, (payload) => {
      console.log(payload)
      window.api.msgFromRenderToMain(SocketEvent.SendMessage, payload)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on])
  useUnmount(() => {
    off(SocketEvent.LoginInfo)
    off(SocketEvent.SendMessage)
  })
  useEffect(() => {
    window.api.msgFromMainToRender((channel: SocketEvent, payload) => {
      console.log(channel, payload)
      emit(channel, payload)
    })
  }, [emit])
  const statesToast = useMemo(() => states.toast, [states.toast])
  useEffect(() => {
    if (statesToast?.callback) {
      const props = _.pick(statesToast, ['loading', 'success', 'error'])
      toast.promise(statesToast?.callback, props)
    }
    onToast(undefined)
  }, [onToast, statesToast])
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{ style: { lineHeight: 1.2, padding: '0 10px', fontSize: '14px' } }}
        containerClassName="!inset-[6px]"
      />
    </>
  )
}
