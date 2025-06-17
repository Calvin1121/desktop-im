import { BrowserView } from 'electron'
import { join } from 'path'
import type { Tab } from '../model/type'

export abstract class TabInstance {
  readonly uuid: string
  readonly view: BrowserView
  readonly tab: Tab
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
    this.view.setBounds(bounds)
    this.view.setAutoResize({ width: true, height: true })
    await this.view.webContents.loadURL(this.tab.url)
    this.attachDebugger()
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

  private attachDebugger() {
    const webContents = this.view.webContents
    if (!webContents.debugger.isAttached()) {
      webContents.debugger.attach('1.3')
    }
    webContents.debugger.sendCommand('Network.enable')
    this.debuggerMessageHandler = this.onDebuggerMessageHandler()
    webContents.debugger.on('message', this.debuggerMessageHandler)
  }
}
