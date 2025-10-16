import { BrowserWindow } from 'electron'
import { Bounds, SendMsgParams, Tab, TabUser } from '../model/type'
import { TabInstance } from './base-tab'
import { IM_TYPE } from '../model'
import { LineWorksTab } from './line-works/tab'
import { tabEventBus, TabEvents } from './event-bus'
import { DefaultTab } from './default-tab/tab'

export class TabMgr {
  private mainWindow: BrowserWindow
  private tabs = new Map<string, TabInstance>()

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.onUpdateTabUser()
    this.onNotifyClicked()
  }

  hideTabs(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, tab] of this.tabs) {
      tab.isVisible = false
    }
  }
  switchTab(tabUuid: string, bounds: Electron.Rectangle): void {
    this.hideTabs()
    const tab = this.tabs.get(tabUuid)
    if (tab) {
      tab.updateBounds(bounds)
      tab.isVisible = true
    }
  }
  onGenerateTab(tab: Tab) {
    if (tab.key === IM_TYPE.LineWorks) {
      return new LineWorksTab(tab)
    }
    return new DefaultTab(tab)
  }
  openUrl(tab: Tab, bounds: Bounds): void {
    const uuid = tab.uuid
    if (this.tabs.has(uuid)) {
      this.switchTab(uuid, bounds)
      return
    }
    const instance = this.onGenerateTab(tab)
    this.tabs.set(uuid, instance)
    this.mainWindow.addBrowserView(instance.getView())
    instance
      .load(bounds)
      .then(() => {
        this.mainWindow.webContents.send('onTabLoaded', uuid)
        // instance.getView()?.webContents.openDevTools()
      })
      .catch((e) => {
        this.mainWindow.webContents.send('onTabLoaded', uuid, e)
      })
  }
  closeTab(tabUuid: string): void {
    const instance = this.tabs.get(tabUuid)
    if (!instance) return
    this.mainWindow.removeBrowserView(instance.getView())
    instance.destroy()
    this.tabs.delete(tabUuid)
  }
  resizeTab(tabUuid: string, bounds: Electron.Rectangle): void {
    const instance = this.tabs.get(tabUuid)
    instance?.updateBounds(bounds)
  }
  onUpdateTabUser() {
    tabEventBus.once(TabEvents.TabUser, (tabUser: TabUser, tabUuid: string) => {
      this.mainWindow.webContents.send('onTabUser', tabUser, tabUuid)
    })
  }
  onNotifyClicked() {
    tabEventBus.on(TabEvents.NotifyClicked, (tabUuid) => {
      this.mainWindow.webContents.send('onTabSwitched', tabUuid)
    })
  }
  onSendMsg(params: SendMsgParams) {
    const { userId, from: tabType } = params
    for (const [_, tab] of this.tabs) {
      if (tab.getUserId() === userId && tab.getTabType() === tabType) {
        tab?.sendMessage?.(params)
        break
      }
    }
  }
}
