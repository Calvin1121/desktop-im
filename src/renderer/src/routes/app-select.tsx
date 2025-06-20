import AppSelect from '@renderer/view/app-select'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app-select')({
  component: () => <AppSelect />
})
