import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Bounds, Tab, TabUser } from '../model/type'

// Custom APIs for renderer
const api = {
  openUrl: (tab: Tab, bounds: Bounds) => ipcRenderer.send('openUrl', tab, bounds),
  openTab: () => ipcRenderer.send('openTab'),
  switchTab: (tabUuid: string, bounds: Bounds) => ipcRenderer.send('switchTab', tabUuid, bounds),
  closeTab: (tabUuid: string, newTabUuid: string, bounds: Bounds) =>
    ipcRenderer.send('closeTab', tabUuid, newTabUuid, bounds),
  resize: (tabUuid: string, bounds: Bounds) => ipcRenderer.send('resize', tabUuid, bounds),
  exitApp: () => ipcRenderer.send('exitApp'),
  onTabLoaded: (callback: (tabUuid: string, err?: Error) => void) =>
    ipcRenderer.on('onTabLoaded', (_, tabUuid: string, err?: Error) => callback(tabUuid, err)),
  onTabUser: (callback: (user: TabUser, tabUuid: string) => void) =>
    ipcRenderer.on('onTabUser', (_, user, tabUuid) => callback(user, tabUuid))
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
