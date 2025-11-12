import toast, { Toaster } from 'react-hot-toast'
import { useMainStates } from './main.provider'
import { useEffect, useMemo } from 'react'
import _ from 'lodash'

export const InitialMain = () => {
  const { states, onToast } = useMainStates()
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
