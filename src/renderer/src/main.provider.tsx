/* eslint-disable react-refresh/only-export-components */
import { ReactNode } from '@tanstack/react-router'
import { createContext, useCallback, useContext, useState } from 'react'

interface IMainContextState {}

type InStates = Partial<IMainContextState> | ((states: IMainContextState) => IMainContextState)

interface IMainContext {
  states: IMainContextState
  updateStates: (inStates: InStates) => void
}
const States: IMainContextState = {}

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
  return { states, updateStates }
}
