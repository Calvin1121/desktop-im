import { app, shell, BrowserWindow, ipcMain, BrowserView } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

export interface Tab {
  name?: string
  uuid: string
  url: string
}
interface View {
  view: BrowserView
  tab: Tab
  wssHandler?: (...args) => void
}

let mainWindow: BrowserWindow
const viewMap: Map<string, View> = new Map()

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    minWidth: 900,
    height: 670,
    minHeight: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createBrowserView(uuid: string): BrowserView {
  const view = new BrowserView({
    webPreferences: {
      partition: `persist:${uuid}`,
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  })
  return view
}

function hideBrowserViews(): void {
  const browserViews = mainWindow.getBrowserViews()
  for (const view of browserViews) {
    mainWindow.removeBrowserView(view)
  }
}

function onHideTabs(): void {
  hideBrowserViews()
}

function onSwitchTab(_, tab, bounds): void {
  onHideTabs()
  const view = viewMap.get(tab.uuid)?.view
  if (view) {
    view.setBounds(bounds)
    view.setAutoResize({ width: true, height: true })
    mainWindow.addBrowserView(view)
  }
}

function getViewByUuid(uuid: string): BrowserView | undefined {
  return viewMap.get(uuid)?.view
}

function onDestroyTab(tab): void {
  // const view = getViewByUuid(tab)
  const { uuid } = tab
  const { view, wssHandler } = viewMap.get(uuid) ?? {}
  if (!view) return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const webContents = view?.webContents as any
  try {
    viewMap.delete(uuid)
    if (webContents.debugger.isAttached()) {
      webContents.debugger.sendCommand('Network.disable')
      wssHandler && webContents.debugger.off('message', wssHandler)
      webContents.debugger.detach()
    }
    mainWindow.removeBrowserView(view)
    webContents.destroy()
  } catch (error) {
    console.error(error)
  }
}

function handleWebSocketData(params, tab: Tab): void {
  try {
    const payloadData = params.response?.payloadData
    if (!payloadData) return

    const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(payloadData)
    let decodedData;

    if (isBase64) {
      try {
        decodedData = Buffer.from(payloadData, 'base64').toString('utf-8')
      } catch (error) {
        console.error(error)
        // decodedData = `[Base64解码失败] ${payloadData}`
      }
      console.info(decodedData, tab)
    }
  } catch (error) {
    console.info(error)
  }
}

function attachDebuggerToView(tab: Tab): void {
  const uuid = tab.uuid
  const view = getViewByUuid(uuid)
  if (!view) return
  const webContents = view?.webContents
  try {
    const wssHandler = (_, method, params): void => {
      if (method === 'Network.webSocketFrameReceived') {
        handleWebSocketData(params, tab)
      }
    }
    if (!webContents?.debugger.isAttached()) {
      webContents?.debugger.attach('1.3')
    }
    webContents?.debugger.sendCommand('Network.enable')
    webContents?.debugger.on('message', wssHandler)
    viewMap.set(tab.uuid, { view, wssHandler, tab })
  } catch (error) {
    console.error(error)
  }
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // new api
  ipcMain.on('openUrl', (_, tab, bounds, success, fail) => {
    const { uuid } = tab
    if (viewMap.has(uuid)) {
      onSwitchTab(_, tab, bounds)
      return
    }
    const view = createBrowserView(uuid)
    viewMap.set(uuid, { view, tab })
    view.setBounds(bounds)
    view.setAutoResize({ width: true, height: true })
    mainWindow.addBrowserView(view)
    view.webContents.loadURL(tab.url)
    view.webContents.once('did-finish-load', () => {
      if (!view.webContents.isDestroyed()) {
        attachDebuggerToView(tab)
      }
    })
    view.webContents.once('did-fail-load', () => { })
    view.webContents.once('dom-ready', () => { })
  })
  ipcMain.on('openTab', onHideTabs)
  ipcMain.on('switchTab', onSwitchTab)
  ipcMain.on('closeTab', (_, tab, newTab, bounds) => {
    if (newTab) {
      onHideTabs()
      onSwitchTab(_, newTab, bounds)
    }
    onDestroyTab(tab)
  })
  ipcMain.on('resize', () => { })
  ipcMain.on('exitApp', () => {
    app.quit()
  })
  // new api

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
