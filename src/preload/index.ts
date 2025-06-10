import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { CustomerApi } from './index.enum'

// Custom APIs for renderer
const api = {
  [CustomerApi.AddTab]: (url: string) => ipcRenderer.send(CustomerApi.AddTab, url),
  [CustomerApi.CreatedTab]: (callbak: (...args) => void) => ipcRenderer.on(CustomerApi.CreatedTab, callbak),
  [CustomerApi.CloseTab]: (uuid: string) => ipcRenderer.send(CustomerApi.CloseTab, uuid),
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
