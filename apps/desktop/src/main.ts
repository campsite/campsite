import { app, BrowserWindow, ipcMain, desktopCapturer, shell, systemPreferences, Menu } from 'electron'
import { autoUpdater } from 'electron-updater'
import crypto from 'crypto'
import path from 'path'

// --- Constants ---
const IS_DEV = !app.isPackaged
const PROTOCOL = IS_DEV ? 'campsite-dev' : 'campsite'
const WEB_URL = IS_DEV ? 'http://localhost:3000' : 'https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app'

// --- State ---
const windowRegistry = new Map<string, BrowserWindow>()
let mainWindow: BrowserWindow | null = null
const pendingProtocolURLs: string[] = []

// --- Protocol URL routing ---
export function handleProtocolURL(url: string): void {
  if (!mainWindow) {
    pendingProtocolURLs.push(url)
    return
  }

  if (url.includes('/calls/join/')) {
    // Convert protocol URL to web URL for loading in the call window
    const protocolUrl = new URL(url)
    const webUrl = `${WEB_URL}/${protocolUrl.host}${protocolUrl.pathname}${protocolUrl.search}`

    // Create a dedicated call window and load the web URL in it
    const id = crypto.randomUUID()
    const callWindow = new BrowserWindow({
      titleBarStyle: 'hiddenInset',
      autoHideMenuBar: true,
      minHeight: 350,
      minWidth: 350,
      trafficLightPosition: { x: 20, y: 20 },
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })
    windowRegistry.set(id, callWindow)
    callWindow.on('closed', () => windowRegistry.delete(id))
    callWindow.loadURL(webUrl)
  } else if (url.includes('://auth/desktop')) {
    // Forward auth URLs to the main window renderer
    mainWindow.webContents.send('protocol-url', url)
    mainWindow.show()
    mainWindow.focus()
  } else {
    // Forward all other URLs to the main window renderer and focus it
    mainWindow.webContents.send('protocol-url', url)
    mainWindow.show()
    mainWindow.focus()
  }
}

// --- Menu state ---
const menuItems: { menu: string; label: string; accelerator?: string }[] = []

function rebuildAppMenu(): void {
  const grouped = new Map<string, { label: string; accelerator?: string }[]>()

  for (const item of menuItems) {
    if (!grouped.has(item.menu)) {
      grouped.set(item.menu, [])
    }
    grouped.get(item.menu)!.push({ label: item.label, accelerator: item.accelerator })
  }

  const template: Electron.MenuItemConstructorOptions[] = []

  for (const [menuLabel, items] of grouped) {
    template.push({
      label: menuLabel,
      submenu: items.map((item) => ({
        label: item.label,
        accelerator: item.accelerator,
        click: () => {
          mainWindow?.webContents.send('menu-item-click', menuLabel, item.label)
        },
      })),
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// --- IPC handler registration ---
function registerIPCHandlers(): void {
  // Window management
  ipcMain.handle('window:maximize', () => {
    BrowserWindow.getFocusedWindow()?.maximize()
  })

  ipcMain.handle('window:minimize', () => {
    BrowserWindow.getFocusedWindow()?.minimize()
  })

  ipcMain.handle('window:restore', () => {
    BrowserWindow.getFocusedWindow()?.restore()
  })

  ipcMain.handle('window:close', () => {
    BrowserWindow.getFocusedWindow()?.close()
  })

  ipcMain.handle('window:blur', () => {
    BrowserWindow.getFocusedWindow()?.blur()
  })

  ipcMain.handle('window:show', (_event, ref?: string) => {
    if (ref && windowRegistry.has(ref)) {
      windowRegistry.get(ref)!.show()
    } else {
      mainWindow?.show()
    }
  })

  ipcMain.handle('window:create', (_event, options: Electron.BrowserWindowConstructorOptions) => {
    const id = crypto.randomUUID()
    const win = new BrowserWindow({
      ...options,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    })
    windowRegistry.set(id, win)
    win.on('closed', () => windowRegistry.delete(id))
    return id
  })

  ipcMain.handle('window:get-all', () => {
    return BrowserWindow.getAllWindows().map((win) => ({
      id: [...windowRegistry.entries()].find(([, w]) => w === win)?.[0] ?? 'main',
    }))
  })

  // App quit
  ipcMain.handle('app:quit', () => {
    app.quit()
  })

  // Badge
  ipcMain.handle('app:set-badge-count', (_event, count: number) => {
    app.setBadgeCount(count)
  })

  ipcMain.handle('app:dock-set-badge', (_event, text: string) => {
    if (process.platform === 'darwin') {
      app.dock.setBadge(text)
    }
  })

  // Screen capture sources
  ipcMain.handle('app:get-capture-sources', async (_event, options) => {
    const sources = await desktopCapturer.getSources({
      types: options.types,
      thumbnailSize: options.thumbnailSize,
    })
    return sources.map((s) => ({
      id: s.id,
      name: s.name,
      thumbnail: s.thumbnail.toDataURL(),
    }))
  })

  // Navigation
  ipcMain.handle('webcontents:go-back', (event) => {
    event.sender.goBack()
  })

  ipcMain.handle('webcontents:go-forward', (event) => {
    event.sender.goForward()
  })

  ipcMain.handle('webcontents:can-go-back', (event) => {
    return event.sender.canGoBack()
  })

  ipcMain.handle('webcontents:can-go-forward', (event) => {
    return event.sender.canGoForward()
  })

  ipcMain.handle('webcontents:load-url', (_event, ref: string, url: string) => {
    const win = windowRegistry.get(ref)
    if (win) win.loadURL(url)
  })

  // System preferences
  ipcMain.handle('system:get-media-access-status', (_event, mediaType: string) => {
    return systemPreferences.getMediaAccessStatus(mediaType as any)
  })

  ipcMain.handle('system:ask-for-media-access', async (_event, mediaType: string) => {
    return systemPreferences.askForMediaAccess(mediaType as any)
  })

  ipcMain.handle('system:open-external', (_event, url: string) => {
    shell.openExternal(url)
  })

  // App menu
  ipcMain.handle('app-menu:add', (_event, menu: string, label: string, accelerator?: string) => {
    menuItems.push({ menu, label, accelerator })
  })

  ipcMain.handle('app-menu:refresh', () => {
    rebuildAppMenu()
  })
}

// --- Auto-updater setup ---
function setupAutoUpdater(): void {
  // Catch all errors — never crash or show UI
  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err)
  })

  // When an update is downloaded, install it on next quit
  autoUpdater.on('update-downloaded', () => {
    autoUpdater.autoInstallOnAppQuit = true
  })

  // Check for updates on launch
  autoUpdater.checkForUpdates().catch((err) => {
    console.error('Auto-updater initial check failed:', err)
  })

  // Check for updates every 4 hours
  setInterval(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('Auto-updater periodic check failed:', err)
    })
  }, 4 * 60 * 60 * 1000)
}

// --- Main window creation ---
function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : undefined,
    frame: process.platform === 'darwin' ? undefined : false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.loadURL(WEB_URL)

  // Open target="_blank" links in the system browser (except app URLs)
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(WEB_URL)) {
      return { action: 'allow' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Forward navigation events to the renderer so navigation buttons update
  win.webContents.on('did-navigate-in-page', () => {
    win.webContents.send('did-navigate-in-page')
  })
  win.webContents.on('did-navigate', () => {
    win.webContents.send('did-navigate-in-page')
  })

  // Deliver any protocol URLs that arrived before the window was ready
  win.webContents.on('did-finish-load', () => {
    while (pendingProtocolURLs.length > 0) {
      const url = pendingProtocolURLs.shift()!
      handleProtocolURL(url)
    }
  })

  return win
}

// --- Step 1: Register protocol before app is ready ---
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL)
}

// --- Step 2: Single instance lock ---
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    // Windows: protocol URL comes via command line on second instance
    const url = commandLine.find((arg) => arg.startsWith(`${PROTOCOL}://`))
    if (url) handleProtocolURL(url)
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  // --- Step 3: macOS open-url handler ---
  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleProtocolURL(url)
  })

  // --- Step 4: App ready — create window, register IPC, setup auto-update ---
  app.whenReady().then(() => {
    mainWindow = createMainWindow()
    registerIPCHandlers()
    if (!IS_DEV) setupAutoUpdater()
  })

  app.on('activate', () => {
    // macOS: re-create window when dock icon clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
    } else {
      mainWindow?.show()
    }
    // Notify renderer of activate event
    mainWindow?.webContents.send('app:activate')
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}

export { windowRegistry, mainWindow, createMainWindow, IS_DEV, PROTOCOL, WEB_URL }
