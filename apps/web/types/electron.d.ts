interface CaptureSourceOptions {
  types: ('window' | 'screen')[]
  thumbnailSize: { width: number; height: number }
}

interface CaptureSource {
  id: string
  name: string
  thumbnail: string
}

interface WindowCreateOptions {
  url?: string
  width?: number
  height?: number
  [key: string]: unknown
}

interface ElectronBridgeAPI {
  // Window
  windowMaximize: () => Promise<void>
  windowMinimize: () => Promise<void>
  windowRestore: () => Promise<void>
  windowClose: () => Promise<void>
  windowBlur: () => Promise<void>
  windowShow: (ref?: string) => Promise<void>
  windowCreate: (options: WindowCreateOptions) => Promise<string>
  getAllWindows: () => Promise<{ id: string }[]>

  // App
  quit: () => Promise<void>
  setBadgeCount: (count: number) => Promise<void>
  dockSetBadge: (text: string) => Promise<void>
  getCaptureSources: (options: CaptureSourceOptions) => Promise<CaptureSource[]>

  // Navigation
  goBack: () => Promise<void>
  goForward: () => Promise<void>
  canGoBack: () => Promise<boolean>
  canGoForward: () => Promise<boolean>
  loadURL: (ref: string, url: string) => Promise<void>

  // System
  getMediaAccessStatus: (mediaType: string) => Promise<string>
  askForMediaAccess: (mediaType: string) => Promise<boolean>
  openExternal: (url: string) => Promise<void>

  // App menu
  addMenuItem: (menu: string, label: string, accelerator?: string) => Promise<void>
  refreshMenu: () => Promise<void>

  // Events (main → renderer)
  onProtocolURL: (callback: (url: string) => void) => () => void
  onNavigate: (callback: () => void) => () => void
  onActivate: (callback: () => void) => () => void

  // Platform info
  platform: 'darwin' | 'win32' | 'linux'
}

interface Window {
  electronAPI?: ElectronBridgeAPI
  todesktop?: unknown
}
