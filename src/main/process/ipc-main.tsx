import { BrowserWindow, dialog, ipcMain, MessageBoxOptions } from 'electron'
import { TabMgr } from '../tab-mgr'

export async function exitAppMessageBox() {
  const exitAppOptions: MessageBoxOptions = {
    icon: '',
    type: 'question',
    buttons: ['确定', '取消'],
    defaultId: 0,
    cancelId: 1,
    title: '确认操作',
    message: '你确定要退出应用吗？'
  }
  const res = await dialog.showMessageBox(exitAppOptions)
  return res.response === 0
}

export const initIpcMain = (app: Electron.App, mainWindow: BrowserWindow) => {
  const tabManager = new TabMgr(mainWindow)

  // new api
  ipcMain.handle('tabProxy', (_, tabUuid, proxyConfig) => tabManager.tabProxy(tabUuid, proxyConfig))
  ipcMain.handle('genUserAgent', async (_, system: string[]) => tabManager.genUserAgent(system))
  ipcMain.handle('refreshTab', (_, tabUuid) => tabManager.refreshTab(tabUuid))
  ipcMain.on('toggleTab', (_, tab, status) => tabManager.toggleTab(tab, status))
  ipcMain.handle('openUrl', (_, tab, bounds, proxyConfig) =>
    tabManager.openUrl(tab, bounds, proxyConfig)
  )
  ipcMain.on('switchTab', (_, tab, bounds) => tabManager.switchTab(tab, bounds))
  ipcMain.handle('openTab', () => tabManager.openTab())
  ipcMain.on('closeTab', (_, uuid, bounds, newTab) => tabManager.onCloseTab(uuid, bounds, newTab))
  ipcMain.on('resize', (_, tabUuid, bounds) => tabManager.resizeTab(tabUuid, bounds))
  ipcMain.handle('exitApp', async () => {
    const isExit = await exitAppMessageBox()
    if (isExit) {
      for (const [_, tab] of tabManager.tabInstances) {
        tab.setUserStatus?.(false)
      }
      return app.quit()
    } else return isExit
  })
  ipcMain.on('msgFromRenderToMain', (_, channel, payload) =>
    tabManager.msgFromRenderToMain(channel, payload)
  )
  // new api
}
