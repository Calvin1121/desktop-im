import { ElectronAPI } from '@electron-toolkit/preload'
import { Tab as TabType, Bounds as BoundsType } from '../model/type'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      openUrl: (tab: Tab, bounds: Bounds) => void
      openTab: () => void
      switchTab: (tab: Tab, bounds: Bounds) => void
      closeTab: (tab: Tab, newTab: Tab, bounds: Bounds) => void
      resize: (tab: Tab, bounds: Bounds) => void
      exitApp: () => void
    }
  }
  interface Tab extends TabType {}
  interface Bounds extends BoundsType {}
}
