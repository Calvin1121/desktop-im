/* eslint-disable react-refresh/only-export-components */
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

interface IMainContextState {
  loginInfo?: Record<string, any>
}

type InStates = Partial<IMainContextState> | ((states: IMainContextState) => IMainContextState)

interface IMainContext {
  states: IMainContextState
  updateStates: (inStates: InStates) => void
}
const States: IMainContextState = {
  loginInfo: undefined
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
  console.log(states)
  const isLoged = useMemo(() => !!states.loginInfo, [states])
  console.log(isLoged)
  return { isLoged, states, updateStates }
}
