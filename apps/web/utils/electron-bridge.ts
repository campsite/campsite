// Bridge adapter — drop-in replacement for @todesktop/client-core imports.
// Delegates all calls to window.electronAPI (exposed by the Electron preload script).
// Gracefully no-ops when running outside Electron (browser / SSR).

// ---------------------------------------------------------------------------
// Types previously imported from @todesktop/client-core/app
// ---------------------------------------------------------------------------

export interface CaptureSourceOptions {
  types: ('window' | 'screen')[]
  thumbnailSize: { width: number; height: number }
}

export interface CaptureSource {
  id: string
  name: string
  thumbnail: string
}

// Replaces ToDesktopOpenProtocolUrlEvent
export interface DesktopProtocolUrlEvent {
  preventDefault: () => void
  url: string
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function getAPI(): ElectronBridgeAPI | null {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI
  }
  return null
}

// ---------------------------------------------------------------------------
// app
// ---------------------------------------------------------------------------

export const app = {
  dock: {
    setBadge: (text: string) => getAPI()?.dockSetBadge(text) ?? Promise.resolve(),
  },
  setBadgeCount: (count: number) => getAPI()?.setBadgeCount(count) ?? Promise.resolve(),
  getCaptureSources: (options: CaptureSourceOptions) =>
    getAPI()?.getCaptureSources(options) ?? Promise.resolve([]),
  on: (event: string, callback: (...args: any[]) => void) => {
    const api = getAPI()
    if (!api) return
    if (event === 'openProtocolURL') {
      api.onProtocolURL((url) => callback(event, { url, preventDefault: () => {} }))
    }
  },
  once: (event: string, callback: (reset: () => void) => void) => {
    const api = getAPI()
    if (!api) return
    if (event === 'registerProtocolUrlListeners') {
      // Immediately invoke — Electron is always ready when renderer loads
      callback(() => {})
    }
  },
}


// ---------------------------------------------------------------------------
// nativeWindow
// ---------------------------------------------------------------------------

export const nativeWindow = {
  maximize: () => getAPI()?.windowMaximize() ?? Promise.resolve(),
  minimize: () => getAPI()?.windowMinimize() ?? Promise.resolve(),
  restore: () => getAPI()?.windowRestore() ?? Promise.resolve(),
  blur: () => getAPI()?.windowBlur() ?? Promise.resolve(),
  show: (opts?: { ref: string }) => getAPI()?.windowShow(opts?.ref) ?? Promise.resolve(),
  create: (options: any) => getAPI()?.windowCreate(options) ?? Promise.resolve(''),
  getWebContents: (opts: { ref: string }) => Promise.resolve(opts.ref),
  getAllWindows: () => getAPI()?.getAllWindows() ?? Promise.resolve([]),
}

// ---------------------------------------------------------------------------
// webContents
// ---------------------------------------------------------------------------

export const webContents = {
  on: (event: string, callback: () => void) => {
    if (event === 'did-navigate-in-page') {
      getAPI()?.onNavigate(callback)
    }
  },
  canGoBack: () => getAPI()?.canGoBack() ?? Promise.resolve(false),
  canGoForward: () => getAPI()?.canGoForward() ?? Promise.resolve(false),
  goBack: () => getAPI()?.goBack() ?? Promise.resolve(),
  goForward: () => getAPI()?.goForward() ?? Promise.resolve(),
  loadURL: (opts: { ref: string }, url: string) => getAPI()?.loadURL(opts.ref, url) ?? Promise.resolve(),
}

// ---------------------------------------------------------------------------
// systemPreferences
// ---------------------------------------------------------------------------

export const systemPreferences = {
  getMediaAccessStatus: (type: string) => getAPI()?.getMediaAccessStatus(type) ?? Promise.resolve('granted'),
  askForMediaAccess: (type: string) => getAPI()?.askForMediaAccess(type) ?? Promise.resolve(true),
}

// ---------------------------------------------------------------------------
// appMenu
// ---------------------------------------------------------------------------

const menuCallbacks = new Map<string, () => void>()

// Listen for menu-item-click events from the main process
if (typeof window !== 'undefined') {
  const api = typeof window !== 'undefined' ? window.electronAPI : null
  if (api) {
    const { ipcRenderer } = window.require?.('electron') ?? {}
    // We can't use ipcRenderer directly (contextIsolation), so we add a preload listener
  }
}

export const appMenu = {
  add: async (menu: string, label: string, callback: () => void, options?: { accelerator: string }) => {
    // Store the callback so we can invoke it when the menu item is clicked
    menuCallbacks.set(`${menu}:${label}`, callback)
    await getAPI()?.addMenuItem(menu, label, options?.accelerator)
  },
  refresh: () => getAPI()?.refreshMenu() ?? Promise.resolve(),
}

// ---------------------------------------------------------------------------
// os
// ---------------------------------------------------------------------------

export const os = {
  openURL: (url: string) => {
    getAPI()?.openExternal(url)
  },
}

// ---------------------------------------------------------------------------
// newApp
// ---------------------------------------------------------------------------

export const newApp = {
  on: (event: string, callback: () => void) => {
    if (event === 'activate') {
      const unsub = getAPI()?.onActivate(callback)
      return Promise.resolve(unsub ?? (() => {}))
    }
    return Promise.resolve(() => {})
  },
}
