import Home from '@renderer/view/home'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => <Home />
})
