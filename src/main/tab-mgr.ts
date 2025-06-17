import { BrowserWindow } from 'electron'
import { Bounds, Tab } from '../model/type'
import { TabInstance } from './base-tab'
import { IM_TYPE } from '../model'
import { LineWorksTab } from './line-works/tab'

export class TabMgr {
  private mainWindow: BrowserWindow
  private tabs = new Map<string, TabInstance>()

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }

  hideTabs(): void {
    for (const view of this.mainWindow.getBrowserViews()) {
      this.mainWindow.removeBrowserView(view)
    }
  }
  switchTab(tab: Tab, bounds: Electron.Rectangle): void {
    this.hideTabs()
    const view = this.tabs.get(tab.uuid)?.getView()
    if (view) {
      view.setBounds(bounds)
      this.mainWindow.addBrowserView(view)
    }
  }
  openUrl(tab: Tab, bounds: Bounds): void {
    const uuid = tab.uuid
    if (this.tabs.has(uuid)) {
      this.switchTab(tab, bounds)
      return
    }
    let instance;
    if (tab.key === IM_TYPE.LineWorks) {
      instance = new LineWorksTab(tab)
    }
    this.tabs.set(uuid, instance)
    this.mainWindow.addBrowserView(instance.getView())
    instance.load(bounds)
  }
  closeTab(tab: Tab): void {
    const instance = this.tabs.get(tab.uuid)
    if (!instance) return
    this.mainWindow.removeBrowserView(instance.getView())
    instance.destroy()
    this.tabs.delete(tab.uuid)
  }
  resizeTab(tab: Tab, bounds: Electron.Rectangle): void {
    const instance = this.tabs.get(tab.uuid)
    instance?.getView().setBounds(bounds)
  }
}
