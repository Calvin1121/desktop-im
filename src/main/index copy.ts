import { app, shell, BrowserWindow, ipcMain, BrowserView } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { CustomerApi } from '../preload/index.enum'
import { v4 } from 'uuid'

let mainWindow
const views: Map<string, BrowserView> = new Map()

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  })

  //   if (!app.isPackaged) {
  mainWindow.webContents.openDevTools()
  //   }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('close', () => { })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  // if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  // } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  // }
}

function createBrowserView(url: string, uuid: string): void {
  if (!url) return
  const view = new BrowserView({
    webPreferences: {
      partition: `persist:${uuid}`, // 独立会话
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  })
  mainWindow.addBrowserView(view)
  view.setBounds({ x: 0, y: 40, width: 900, height: 630 })
  // // 页面加载完成后设置监控
  view.webContents.on('did-finish-load', () => {
    if (!view.webContents.isDestroyed()) {
      // setupWebSocketMonitoring(view.webContents)
    }
  })
  // view.webContents.openDevTools()
  // view.webContents.loadURL('http://baidu.com')
  views.set(uuid, view)
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

  createWindow()

  // IPC test
  // ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on(CustomerApi.AddTab, (event: Electron.IpcMainEvent, url) => {
    const uuid = v4()
    createBrowserView(url, uuid)
    event.sender.send(CustomerApi.CreatedTab, uuid, url)
  })

  ipcMain.on(CustomerApi.CloseTab, (event: Electron.IpcMainEvent, uuid: string) => {
    const view = views.get(uuid)
    if (view) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const webContents = view.webContents as any
        if (webContents.debugger.isAttached()) {
          webContents.debugger.detach()
        }
        mainWindow.removeBrowserView(view)
        webContents.destroy()
        webContents.close()
      } catch (error) {
        console.error('关闭标签页失败:', error)
      }
      views.delete(uuid)
    }
  })

  ipcMain.on(CustomerApi.SetUrl, (event: Electron.IpcMainEvent, uuid: string, url: string) => {
    console.info(uuid, url)
  })

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
