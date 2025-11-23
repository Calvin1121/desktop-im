import { BrowserWindow, dialog, ipcMain, MessageBoxOptions } from 'electron'
import { TabMgr } from '../tab-mgr'
import { BaseTab } from '../../model/type'

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
  ipcMain.on('toggleTab', (_, tabUuid, status) => tabManager.toggleTab(tabUuid, status))
  ipcMain.on('openUrl', (_, tab, bounds) => tabManager.openUrl(tab, bounds))
  ipcMain.on('switchTab', (_, tabUuid, bounds) => tabManager.switchTab(tabUuid, bounds))
  ipcMain.on('openTab', (tab: BaseTab) => tabManager.openTab(tab))
  ipcMain.on('closeTab', (_, tabUuid, newTabUuid, bounds) => {
    if (newTabUuid) tabManager.switchTab(newTabUuid, bounds)
    tabManager.closeTab(tabUuid)
  })
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
