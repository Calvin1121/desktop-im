import { ElectronAPI } from '@electron-toolkit/preload'
import { CustomerApi } from './index.enum'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      [CustomerApi.AddTab]: (url: string) => void
      [CustomerApi.CreatedTab]: (callbak: (...args) => void) => void
      [CustomerApi.CloseTab]: (uuid: string) => void
    }
  }
}
