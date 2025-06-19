import { BrowserView } from 'electron'
import { join } from 'path'
import type { Bounds, Tab } from '../model/type'
import { tabEventBus, TabEvents } from './event-bus'

export abstract class TabInstance {
  readonly uuid: string
  readonly view: BrowserView
  readonly tab: Tab
  private _isVisible: boolean = false
  set isVisible(visible) {
    this._isVisible = visible
    this.onSwitchVisibleStatus(visible)
  }
  get isVisible() {
    return this._isVisible
  }
  private bounds: Bounds = {} as Bounds
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
    const webContents = this.view.webContents as any
    if (webContents.debugger.isAttached()) {
      webContents.debugger.off('message', this.debuggerMessageHandler)
      webContents.debugger.detach()
    }
    webContents.destroy()
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
}
