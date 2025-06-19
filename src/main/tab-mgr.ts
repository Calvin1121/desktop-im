import { BrowserWindow } from 'electron'
import { Bounds, Tab } from '../model/type'
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
  }

  hideTabs(): void {
    for (const view of this.mainWindow.getBrowserViews()) {
      this.mainWindow.removeBrowserView(view)
    }
  }
  switchTab(tabUuid: string, bounds: Electron.Rectangle): void {
    this.hideTabs()
    const view = this.tabs.get(tabUuid)?.getView()
    if (view) {
      view.setBounds(bounds)
      this.mainWindow.addBrowserView(view)
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
    instance?.getView().setBounds(bounds)
  }
  onUpdateTabUser() {
    tabEventBus.once(TabEvents.TabUser, (tabUser, tabUuid) => {
      this.mainWindow.webContents.send('onTabUser', tabUser, tabUuid)
    })
  }
}
