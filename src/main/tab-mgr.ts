import { BrowserWindow, session } from 'electron'
import { Bounds, IProxyTabConfig, Tab, TabUser } from '../model/type'
import { TabInstance } from './base-tab'
import { IM_TYPE } from '../model'
import { LineWorksTab } from './line-works/tab'
import { tabEventBus, TabEvents } from './event-bus'
import { DefaultTab } from './default-tab/tab'
import UserAgent from 'user-agents'
import { SocketEvent } from '../model/common.constant'
import { normalizeProxyAddress } from './utils'

export class TabMgr {
  private mainWindow: BrowserWindow
  private tabs = new Map<string, TabInstance>()

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.onUpdateTabUser()
    this.onNotifyClicked()
    this.onEmitMsgFromMainToRender()
  }

  get tabInstances(): Map<string, TabInstance> {
    return this.tabs
  }
  toggleTab(tabUuid: string, status: boolean) {
    const tab = this.tabs.get(tabUuid)
    if (tab) {
      tab.isVisible = status
    }
  }
  genUserAgent(system?: string[]) {
    try {
      if (system?.length) {
        const platform = system[Math.floor(Math.random() * system.length)]
        return new UserAgent({ platform }).toString()
      }
    } catch (error) {
      console.error(error)
    }
    return new UserAgent().toString()
  }
  refreshTab(tabUuid: string) {
    return new Promise((resolve, reject) => {
      const tab = this.tabs.get(tabUuid)
      const webContents = tab?.view.webContents
      if (webContents) {
        webContents.once('did-finish-load', () => resolve(true))
        webContents.reloadIgnoringCache()
      } else {
        reject(false)
      }
    })
  }
  async tabProxy(tabUuid, proxyConfig: IProxyTabConfig) {
    try {
      const tab = this.tabs.get(tabUuid)
      const webContents = tab?.view.webContents
      if (webContents) {
        const { serve, ip, type, agent } = proxyConfig
        const proxyRules =
          serve && ip && type
            ? {
                proxyRules: `${type}=${normalizeProxyAddress(ip)}`,
                proxyBypassRules: 'localhost,127.0.0.1,<local>'
              }
            : {}
        await webContents.session.setUserAgent(agent)
        await webContents.session.setProxy(proxyRules)
      }
    } catch (error) {
      console.error(error)
    }
  }
  hideTabs(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, tab] of this.tabs) {
      tab.isVisible = false
    }
  }
  switchTab(tabUuid: string, bounds: Electron.Rectangle): void {
    this.hideTabs()
    const tabInstances = this.tabs.get(tabUuid)
    if (tabInstances) {
      tabInstances.updateBounds(bounds)
      tabInstances.isVisible = true
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
    try {
      const instance = this.tabs.get(tabUuid)
      if (!instance) return
      this.mainWindow?.removeBrowserView?.(instance.getView())
      instance?.destroy?.()
      instance?.setUserStatus?.(false)
      this.tabs.delete(tabUuid)
    } catch (error) {
      console.error(error)
    }
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
  onEmitMsgFromMainToRender() {
    tabEventBus.on(TabEvents.ForwardMsg, (channel, payload) => {
      this.mainWindow.webContents.send('msgFromMainToRender', channel, payload)
    })
  }
  onNotifyClicked() {
    tabEventBus.on(TabEvents.NotifyClicked, (tabUuid) => {
      this.mainWindow.webContents.send('onTabSwitched', tabUuid)
    })
  }
  msgFromRenderToMain(channel, payload) {
    if (channel === SocketEvent.SendMessage) {
      const { userId, from: tabType } = payload
      for (const [_, tab] of this.tabs) {
        if (tab.getUserId() === userId && tab.getTabType() === tabType) {
          tab?.sendMessage?.(payload)
          break
        }
      }
    }
  }
}
