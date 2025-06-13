import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openUrl: (...args) => ipcRenderer.send('openUrl', ...args),
  openTab: () => ipcRenderer.send('openTab'),
  switchTab: (...args) => ipcRenderer.send('switchTab', ...args),
  closeTab: (...args) => ipcRenderer.send('closeTab', ...args),
  resize: () => ipcRenderer.send('resize'),
  exitApp: () => ipcRenderer.send('exitApp')
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
