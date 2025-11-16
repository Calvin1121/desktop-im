import { ElectronAPI } from '@electron-toolkit/preload'
import { Tab as TabType, Bounds as BoundsType, TabUser as TabUserType } from '../model/type'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getIPLocation: (ip?: string, port?: string) => Promise<IPInfo | null>
      genUserAgent: (system?: string[]) => Promise<string>
      refreshTab: (tabUuid: string) => Promise<boolean>
      toggleTab: (tabUuid: string, status: boolean) => void
      openUrl: (tab: Tab, bounds: Bounds) => void
      openTab: () => void
      switchTab: (tabUuid: string, bounds: Bounds) => void
      closeTab: (tabUuid: string, newTabUuid: string, bounds: Bounds) => void
      resize: (tabUuid: string, bounds: Bounds) => void
      exitApp: () => Promise<Electron.MessageBoxReturnValue | undefined>
      onTabLoaded: (callback?: (tabUuid: string, err?: Error) => void) => void
      onTabUser: (callback?: (user: TabUser, tabUuid: string) => void) => void
      onTabSwitched: (callback?: (tabUuid: string) => void) => void
      msgFromRenderToMain: (channel, payload) => void
      msgFromMainToRender: (callback?: (channel, payload) => void) => void
    }
  }
  interface Tab extends TabType {}
  interface Bounds extends BoundsType {}
  interface TabUser extends TabUserType {}
}
