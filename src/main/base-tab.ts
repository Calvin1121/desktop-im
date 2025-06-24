import { BrowserView, Notification } from 'electron'
import { join } from 'path'
import type { Bounds, Tab } from '../model/type'
import { tabEventBus, TabEvents } from './event-bus'
import { Worker } from 'node:worker_threads'
import creatWorker from './workers/wss-worker?nodeWorker'
import { FetchOptions } from './fetcher'
import { showNotificationWithPermissionCheck } from './process/notify'

export abstract class TabInstance {
  readonly uuid: string
  view: BrowserView
  readonly tab: Tab
  private wssWorker: Worker | null = null
  private _isVisible: boolean = false
  set isVisible(visible) {
    this._isVisible = visible
    this.onSwitchVisibleStatus(visible)
  }
  get isVisible() {
    return this._isVisible
  }
  bounds: Bounds = {} as Bounds
  private debuggerMessageHandler?: (event: Electron.Event, method: string, params: any) => void
  protected abstract onAuthInfoByUrl(url: string)
  protected abstract onDebuggerMessageHandler(): (
    event: Electron.Event,
    method: string,
    params: any
  ) => void

  constructor(tab: Tab) {
    this.tab = tab
    this.uuid = tab.uuid
    this.view = new BrowserView({
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        partition: `persist:${this.uuid}`,
        contextIsolation: true,
        sandbox: false
      }
    })
  }

  async load(bounds: Electron.Rectangle) {
    this.bounds = bounds
    this.isVisible = true
    await this.view.webContents.loadURL(this.tab.url).then(() => this.attachDebugger())
  }

  getView(): BrowserView {
    return this.view
  }

  destroy() {
    this.wssWorker?.terminate()
    this.wssWorker = null
    const view = this.view as any
    const webContents = view.webContents
    if (webContents.debugger.isAttached()) {
      webContents.debugger.off('message', this.debuggerMessageHandler)
      webContents.debugger.detach()
    }
    webContents.destroy()
    view.destroy?.()
    this.view = null as any
  }

  private onSwitchVisibleStatus(val) {
    const { x, y, width, height } = this.bounds
    const bounds = val
      ? { x, y, width, height }
      : { x: -width - x, y: height + y, width: 0, height: 0 }
    this.view.setBounds(bounds)
    this.view.setAutoResize({ width: true, height: true })
  }

  updateBounds(bounds: Bounds) {
    this.bounds = bounds
    if (this.isVisible) {
      this.view.setBounds(bounds)
      this.view.setAutoResize({ width: true, height: true })
    }
  }

  private attachDebugger() {
    const webContents = this.view.webContents
    if (!webContents.debugger.isAttached()) {
      webContents.debugger.attach('1.3')
    }
    webContents.debugger.sendCommand('Network.enable')
    this.debuggerMessageHandler = this.onDebuggerMessageHandler()
    webContents.debugger.on('message', this.debuggerMessageHandler)
  }
  updateTabUser(tabUser) {
    tabEventBus.emit(TabEvents.TabUser, tabUser, this.tab.uuid)
  }
  protected initWssWorker() {
    if (!this.wssWorker) {
      this.wssWorker = creatWorker({ workerData: 'worker' })

      // this.wssWorker.on('message', (msg) => {
      //   console.log('[Worker] Result:', msg)
      // })

      // this.wssWorker.on('error', (err) => {
      //   console.error('[Worker] Error:', err)
      // })

      // this.wssWorker.on('exit', (code) => {
      //   console.warn('[Worker] exited:', code)
      //   this.wssWorker = null
      // })
    }
  }
  protected forwardPayload(requestArg: { url: string; options: FetchOptions }) {
    this.initWssWorker()
    this.wssWorker?.postMessage(requestArg)
  }
  protected onNotify(options: Electron.NotificationConstructorOptions, callback?: () => void) {
    showNotificationWithPermissionCheck(options, callback)
  }
}
