// Minimal bridge adapter for packages/ui components.
// Mirrors the subset of apps/web/utils/electron-bridge.ts needed by Link.tsx and utils.ts.
// Delegates all calls to window.electronAPI (exposed by the Electron preload script).
// Gracefully no-ops when running outside Electron (browser / SSR).

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function getAPI() {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI
  }
  return null
}

// ---------------------------------------------------------------------------
// nativeWindow (used by utils.ts → desktopJoinCall)
// ---------------------------------------------------------------------------

export const nativeWindow = {
  create: (options: any) => getAPI()?.windowCreate(options) ?? Promise.resolve(''),
  show: (opts?: { ref: string }) => getAPI()?.windowShow(opts?.ref) ?? Promise.resolve(),
  blur: () => getAPI()?.windowBlur() ?? Promise.resolve(),
  getWebContents: (opts: { ref: string }) => Promise.resolve(opts.ref),
}

// ---------------------------------------------------------------------------
// webContents (used by utils.ts → desktopJoinCall)
// ---------------------------------------------------------------------------

export const webContents = {
  loadURL: (opts: { ref: string }, url: string) => getAPI()?.loadURL(opts.ref, url) ?? Promise.resolve(),
  on: (event: string, callback: () => void) => {
    if (event === 'did-navigate-in-page') {
      getAPI()?.onNavigate(callback)
    }
  },
  canGoBack: () => getAPI()?.canGoBack() ?? Promise.resolve(false),
  canGoForward: () => getAPI()?.canGoForward() ?? Promise.resolve(false),
}

// ---------------------------------------------------------------------------
// newApp (used by utils.ts → desktopJoinCall)
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

// ---------------------------------------------------------------------------
// os (used by Link.tsx and utils.ts → openBlank, specialLinkClickHandler)
// ---------------------------------------------------------------------------

export const os = {
  openURL: (url: string) => {
    getAPI()?.openExternal(url)
  },
}
