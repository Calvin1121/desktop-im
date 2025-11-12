/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

interface IToast {
  callback?: Promise<any> | (() => any)
  loading?: string
  success?: string
  error?: string
}

interface LoginInfo {
  token: string
  tabCount: number
}

interface IMainContextState {
  isSkipLogin: boolean
  loginInfo?: LoginInfo
  toast?: IToast
}

type InStates = Partial<IMainContextState> | ((states: IMainContextState) => IMainContextState)

interface IMainContext {
  states: IMainContextState
  updateStates: (inStates: InStates) => void
}
const States: IMainContextState = {
  isSkipLogin: false
}

export const MainContext = createContext<IMainContext>({
  states: States,
  updateStates: () => {}
})

export function MainProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState({ ...States })
  const updateStates = useCallback((inStates: InStates) => {
    setStates((prev) => (inStates instanceof Function ? inStates(prev) : { ...prev, ...inStates }))
  }, [])
  const value = { states, updateStates }
  return <MainContext.Provider value={value}>{children}</MainContext.Provider>
}
export function useMainStates() {
  const { states, updateStates } = useContext(MainContext)
  const onToast = useCallback((toast?: IToast) => updateStates({ toast }), [updateStates])
  const isLoged = useMemo(() => !!states.loginInfo?.token, [states])
  const isSkipLogin = useMemo(() => states.isSkipLogin, [states.isSkipLogin])
  return { isLoged, isSkipLogin, states, updateStates, onToast }
}
