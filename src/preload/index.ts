import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Bounds, SendMsgParams, Tab, TabUser } from '../model/type'
import { FetchOptions } from '../main/fetcher'

// Custom APIs for renderer
const api = {
  callAPI: (url: string, options?: FetchOptions) => ipcRenderer.invoke('callAPI', url, options),
  genUserAgent: (system?: string[]) => ipcRenderer.invoke('genUserAgent', system),
  refreshTab: (tabUuid: string) => ipcRenderer.invoke('refreshTab', tabUuid),
  toggleTab: (tabUuid: string, status: boolean) => ipcRenderer.send('toggleTab', tabUuid, status),
  openUrl: (tab: Tab, bounds: Bounds) => ipcRenderer.send('openUrl', tab, bounds),
  openTab: () => ipcRenderer.send('openTab'),
  switchTab: (tabUuid: string, bounds: Bounds) => ipcRenderer.send('switchTab', tabUuid, bounds),
  closeTab: (tabUuid: string, newTabUuid: string, bounds: Bounds) =>
    ipcRenderer.send('closeTab', tabUuid, newTabUuid, bounds),
  resize: (tabUuid: string, bounds: Bounds) => ipcRenderer.send('resize', tabUuid, bounds),
  exitApp: () => ipcRenderer.invoke('exitApp'),
  onTabLoaded: (callback: (tabUuid: string, err?: Error) => void) =>
    ipcRenderer.on('onTabLoaded', (_, tabUuid: string, err?: Error) => callback(tabUuid, err)),
  onTabUser: (callback: (user: TabUser, tabUuid: string) => void) =>
    ipcRenderer.on('onTabUser', (_, user, tabUuid) => callback(user, tabUuid)),
  onTabSwitched: (callback: (tabUuid: string) => void) =>
    ipcRenderer.on('onTabSwitched', (_, tabUuid: string) => callback(tabUuid)),
  sendMsg: (params: SendMsgParams) => ipcRenderer.invoke('sendMsg', params)
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
