import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { BaseTab, Bounds, IProxyTabConfig, Tab, TabUser } from '../model/type'

// Custom APIs for renderer
const api = {
  tabProxy: (tabUuid: string, proxyConfig: IProxyTabConfig) =>
    ipcRenderer.invoke('tabProxy', tabUuid, proxyConfig),
  genUserAgent: (system?: string[]) => ipcRenderer.invoke('genUserAgent', system),
  refreshTab: (tabUuid: string) => ipcRenderer.invoke('refreshTab', tabUuid),
  toggleTab: (tab: BaseTab, status: boolean) => ipcRenderer.send('toggleTab', tab, status),
  openUrl: (tab: Tab, bounds: Bounds, proxyConfig: IProxyTabConfig) =>
    ipcRenderer.invoke('openUrl', tab, bounds, proxyConfig),
  openTab: () => ipcRenderer.invoke('openTab'),
  switchTab: (tab: BaseTab, bounds: Bounds) => ipcRenderer.send('switchTab', tab, bounds),
  closeTab: (tabUuid: string, bounds: Bounds, newTab?: BaseTab) =>
    ipcRenderer.send('closeTab', tabUuid, bounds, newTab),
  resize: (tabUuid: string, bounds: Bounds) => ipcRenderer.send('resize', tabUuid, bounds),
  exitApp: () => ipcRenderer.invoke('exitApp'),
  onTabUser: (callback: (user: TabUser, tabUuid: string) => void) =>
    ipcRenderer.on('onTabUser', (_, user, tabUuid) => callback(user, tabUuid)),
  onTabSwitched: (callback: (tabUuid: string) => void) =>
    ipcRenderer.on('onTabSwitched', (_, tabUuid: string) => callback(tabUuid)),
  msgFromRenderToMain: (channel, payload) =>
    ipcRenderer.send('msgFromRenderToMain', channel, payload),
  msgFromMainToRender: (callback: (channel, payload) => void) =>
    ipcRenderer.on('msgFromMainToRender', (_, channel, payload) => callback(channel, payload))
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
