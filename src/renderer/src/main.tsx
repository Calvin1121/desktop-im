import './assets/main.scss'
import '@ant-design/v5-patch-for-react-19'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { MainProvider } from './main.provider'
import { ConfigSWR } from './main.swr'
import InitialMain from './main.initial'
import GlobalToast from './main.toast'

// Create a new router instance
const router = createRouter({
  routeTree,
  history: createMemoryHistory({
    initialEntries: ['/']
  })
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainProvider>
      <ConfigSWR>
        <InitialMain />
        <GlobalToast />
        <RouterProvider router={router} />
      </ConfigSWR>
    </MainProvider>
  </StrictMode>
)
