// tab-instance.ts
import { BrowserView, WebContents } from 'electron'
import { join } from 'path'
import _ from 'lodash'
import { API_MAP } from '../renderer/src/app.model'
import type { Tab } from '../type'

export interface CommonApi {
  requestId: string
  url: string
  headers: Record<string, string>
  method: string
  postData?: string
  onAuth: Promise<Record<string, string>>
}

export class TabInstance {
  public readonly uuid: string
  public readonly view: BrowserView
  public readonly tab: Tab

  private apisMap = new Map<string, CommonApi>()
  private onMsgHandler?: (event: Electron.Event, method: string, params: any) => void

  constructor(tab: Tab) {
    this.tab = tab
    this.uuid = tab.uuid
    this.view = new BrowserView({
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        partition: `persist:${this.uuid}`,
        contextIsolation: true,
        sandbox: false,
      }
    })
  }

  public async load(bounds: Electron.Rectangle) {
    this.view.setBounds(bounds)
    this.view.setAutoResize({ width: true, height: true })
    await this.view.webContents.loadURL(this.tab.url)
    this.attachDebugger()
  }

  public getView(): BrowserView {
    return this.view
  }

  public destroy() {
    const webContents = this.view.webContents
    if (webContents.debugger.isAttached()) {
      this.onMsgHandler && webContents.debugger.off('message', this.onMsgHandler)
      webContents.debugger.detach()
    }
    webContents.destroy()
  }

  private getAuthInfoByUrl(url: string): Promise<Record<string, string>> {
    return this.view.webContents.debugger
      .sendCommand('Network.getCookies', { urls: [url] })
      .then((data) => this.tab.onAuth?.(data) || {})
      .catch(() => ({}))
  }

  private attachDebugger() {
    const webContents = this.view.webContents
    const tab = this.tab
    const apis = _.get(API_MAP, tab.key) || {}

    const onMessage = async (_: any, method: string, params: any) => {
      if (method === 'Network.requestWillBeSent') {
        const { requestId, request } = params
        const { url, method, headers, postData, hasPostData } = request

        for (const key in apis) {
          const item = apis[key]
          if (url.includes(item.urlKey)) {
            const onAuth = this.getAuthInfoByUrl(url)
            const api: CommonApi = { requestId, url, method, headers, onAuth }
            if (hasPostData) api.postData = postData
            this.apisMap.set(`${tab.key}-${key}`, api)
          }
        }
      }

      if (method === 'Network.webSocketFrameReceived') {
        const payload = params.response?.payloadData
        if (payload && /^[A-Za-z0-9+/]+={0,2}$/.test(payload)) {
          try {
            const decoded = Buffer.from(payload, 'base64').toString('utf-8')
            console.debug(`[WebSocket][${tab.name}] ${decoded}`)
          } catch (err) {
            console.warn('Base64 decode failed', err)
          }
        }
      }
    }

    if (!webContents.debugger.isAttached()) {
      webContents.debugger.attach('1.3')
    }
    webContents.debugger.sendCommand('Network.enable')
    webContents.debugger.on('message', onMessage)

    this.onMsgHandler = onMessage
  }
}
