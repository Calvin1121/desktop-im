import { useMainStates } from '@renderer/main.provider'
import { Navigate } from '@tanstack/react-router'

export default function Home() {
  const { isLoged } = useMainStates()
  if (isLoged) return <Navigate to="/app-select" replace />
  else return <Navigate to="/login" replace />
}
