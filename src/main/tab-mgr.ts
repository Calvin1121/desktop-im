import { BrowserView, BrowserWindow, WebContents } from 'electron'
import { join } from 'path'
import _ from 'lodash'
import { API_MAP, IM_TYPE } from '../renderer/src/app.model'
import { Bounds, Tab } from '../type'

interface ViewContext {
  view: BrowserView
  tab: Tab
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMsgHandler?: (event: Electron.Event, method: string, params: any) => void
}
interface CommonApi {
  requestId: string
  url: string
  headers: Record<string, string>
  method: string
  postData?: string
  onAuth: Promise<Record<string, string>>
}

export class TabMgr {
  private mainWindow: BrowserWindow
  private viewMap = new Map<string, ViewContext>()
  private apisMap = new Map<string, CommonApi>()
  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
  }
  private createBrowserView(uuid: string): BrowserView {
    return new BrowserView({
      webPreferences: {
        partition: `persist:${uuid}`,
        preload: join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false
      }
    })
  }
  private applyViewLayout(view: BrowserView, bounds: Electron.Rectangle): void {
    view.setBounds(bounds)
    view.setAutoResize({ width: true, height: true })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleWebSocketData(params: any, tab: Tab): void {
    const payloadData = params.response?.payloadData
    if (!payloadData) return

    const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(payloadData)
    if (isBase64) {
      try {
        const decoded = Buffer.from(payloadData, 'base64').toString('utf-8')
        console.debug(`[WebSocket][${tab.name}] ${decoded}`)
      } catch (err) {
        console.warn('Base64 decode failed', err)
      }
    }
  }
  private getAuthInfoByUrl(webContents: WebContents, url: string, tab: Tab): Promise<Record<string, string>> {
    return webContents.debugger
      .sendCommand('Network.getCookies', { urls: [url] })
      .then((data) => tab.onAuth?.(data) || {})
      .catch(() => {})
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleRequestWillBeSent(webContents: WebContents, params: any, tab: Tab): void {
    const { requestId, request } = params
    const { url, headers, method, postData, hasPostData } = request
    const apis = _.get(API_MAP, tab.key) || {}

    for (const key in apis) {
      const id = `${tab.uuid}-${tab.key}-${key}`
      const item = apis[key]
      if (url.includes(item.urlKey)) {
        const onAuth = this.getAuthInfoByUrl(webContents, url, tab)
        const api: CommonApi = { requestId, url, method, headers, onAuth }
        if (hasPostData) api.postData = postData
        console.info(api)
        this.apisMap.set(id, api)
      }
    }
  }
  private attachDebuggerToView(tab: Tab): void {
    const ctx = this.viewMap.get(tab.uuid)
    if (!ctx) return
    const { view } = ctx
    const webContents = view.webContents

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const onMsgHandler = (_: any, method: string, params: any): void => {
        if (method === 'Network.webSocketFrameReceived') {
          this.handleWebSocketData(params, tab)
        }
        if (method === 'Network.requestWillBeSent') {
          this.handleRequestWillBeSent(webContents, params, tab)
        }
        if (method === 'Network.loadingFinished') {
          // this.handleLoadingFinished(params, tab)
        }
      }

      if (!webContents.debugger.isAttached()) {
        webContents.debugger.attach('1.3')
      }
      webContents.debugger.sendCommand('Network.enable')
      webContents.debugger.on('message', onMsgHandler)

      this.viewMap.set(tab.uuid, { view, tab, onMsgHandler })
    } catch (err) {
      console.error('attachDebugger error:', err)
    }
  }

  public hideTabs(): void {
    for (const view of this.mainWindow.getBrowserViews()) {
      this.mainWindow.removeBrowserView(view)
    }
  }
  public switchTab(tab: Tab, bounds: Electron.Rectangle): void {
    this.hideTabs()
    const ctx = this.viewMap.get(tab.uuid)
    if (!ctx) return
    const view = ctx.view
    this.applyViewLayout(view, bounds)
    this.mainWindow.addBrowserView(view)
  }
  openTab(tab: Tab, bounds: Bounds): void {
    const uuid = tab.uuid
    if (this.viewMap.has(uuid)) {
      this.switchTab(tab, bounds)
      return
    }
    const view = this.createBrowserView(uuid)
    this.viewMap.set(uuid, { view, tab })
    this.applyViewLayout(view, bounds)
    this.mainWindow.addBrowserView(view)
    view.webContents.loadURL(tab.url)
    view.webContents.once('did-finish-load', () => {
      if (!view.webContents.isDestroyed()) {
        this.attachDebuggerToView(tab)
      }
    })
  }
  public closeTab(tab: Tab): void {
    const ctx = this.viewMap.get(tab.uuid)
    if (!ctx) return
    const { view, onMsgHandler } = ctx
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const webContents = view.webContents as any
    try {
      if (webContents.debugger.isAttached()) {
        webContents.debugger.sendCommand('Network.disable')
        onMsgHandler && webContents.debugger.off('message', onMsgHandler)
        webContents.debugger.detach()
      }
      this.mainWindow.removeBrowserView(view)
      webContents.destroy()
      this.viewMap.delete(tab.uuid)
      for (const key of this.apisMap.keys()) {
        if (key.startsWith(tab.uuid)) this.apisMap.delete(key)
      }
    } catch (err) {
      console.error('closeTab error:', err)
    }
  }
  public resizeTab(tab: Tab, bounds: Electron.Rectangle): void {
    const ctx = this.viewMap.get(tab.uuid)
    if (ctx) ctx.view.setBounds(bounds)
  }
}
