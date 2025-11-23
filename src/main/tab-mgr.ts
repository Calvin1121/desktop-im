import { BrowserWindow } from 'electron'
import { BaseTab, Bounds, IProxyTabConfig, Tab, TabUser } from '../model/type'
import { TabInstance } from './base-tab'
import { IM_TYPE } from '../model'
import { LineWorksTab } from './line-works/tab'
import { tabEventBus, TabEvents } from './event-bus'
import { DefaultTab } from './default-tab/tab'
import UserAgent from 'user-agents'
import { SocketEvent } from '../model/common.constant'

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
  toggleTab(tab: BaseTab, status: boolean) {
    const tabInstance = this.tabs.get(tab.uuid)
    if (tabInstance) {
      tabInstance.updateTab(tab)
      tabInstance.isVisible = status
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
      const tabInstance = this.tabs.get(tabUuid)
      const webContents = tabInstance?.view.webContents
      if (webContents) {
        webContents.once('did-finish-load', () => resolve(true))
        webContents.reloadIgnoringCache()
      } else {
        reject(false)
      }
    })
  }
  async tabProxy(tabUuid: string, proxyConfig: IProxyTabConfig, isRefresh: boolean = true) {
    try {
      const tabInstance = this.tabs.get(tabUuid)
      const webContents = tabInstance?.view.webContents
      if (webContents) {
        const { serve, ip, type, agent, port } = proxyConfig
        const _port = `:${port || '8080'}`
        const ipPort = ip + _port
        const proxyRules =
          serve && ip && type
            ? {
                proxyRules: `${type}=${ipPort};${type.toLowerCase()}=${ipPort}`
              }
            : {}
        await webContents.session.setUserAgent(agent)
        await webContents.session.setProxy(proxyRules)
      }
    } catch (error) {
      console.error(error)
    }
  }
  openTab() {
    this.hideTabs()
  }
  onCloseTab(tabUuid: string, bounds: Bounds, newTab?: BaseTab) {
    if (newTab) this.switchTab(newTab, bounds)
    this.closeTab(tabUuid)
  }
  hideTabs(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, tab] of this.tabs) {
      tab.isVisible = false
    }
  }
  switchTab(tab: BaseTab, bounds: Electron.Rectangle): void {
    this.hideTabs()
    const tabInstance = this.tabs.get(tab.uuid)
    if (tabInstance) {
      tabInstance.updateTab(tab)
      tabInstance.updateBounds(bounds)
      tabInstance.isVisible = true
    }
  }
  onGenerateTab(tab: Tab) {
    if (tab.key === IM_TYPE.LineWorks) {
      return new LineWorksTab(tab)
    }
    return new DefaultTab(tab)
  }
  openUrl(tab: Tab, bounds: Bounds, proxyConfig: IProxyTabConfig) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const uuid = tab.uuid
      const res = { tabUuid: uuid }
      if (this.tabs.has(uuid)) {
        this.switchTab(tab, bounds)
        return
      }
      const instance = this.onGenerateTab(tab)
      this.tabs.set(uuid, instance)
      this.mainWindow.addBrowserView(instance.getView())
      await this.tabProxy(uuid, proxyConfig, false)
      instance
        .load(bounds)
        .then(() => resolve(res))
        .catch((err) => resolve({ ...res, err }))
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
