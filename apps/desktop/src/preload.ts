import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Window
  windowMaximize: () => ipcRenderer.invoke('window:maximize'),
  windowMinimize: () => ipcRenderer.invoke('window:minimize'),
  windowRestore: () => ipcRenderer.invoke('window:restore'),
  windowClose: () => ipcRenderer.invoke('window:close'),
  windowBlur: () => ipcRenderer.invoke('window:blur'),
  windowShow: (ref?: string) => ipcRenderer.invoke('window:show', ref),
  windowCreate: (options: any) => ipcRenderer.invoke('window:create', options),
  getAllWindows: () => ipcRenderer.invoke('window:get-all'),

  // App
  setBadgeCount: (count: number) => ipcRenderer.invoke('app:set-badge-count', count),
  dockSetBadge: (text: string) => ipcRenderer.invoke('app:dock-set-badge', text),
  getCaptureSources: (options: any) => ipcRenderer.invoke('app:get-capture-sources', options),
  quit: () => ipcRenderer.invoke('app:quit'),

  // Navigation
  goBack: () => ipcRenderer.invoke('webcontents:go-back'),
  goForward: () => ipcRenderer.invoke('webcontents:go-forward'),
  canGoBack: () => ipcRenderer.invoke('webcontents:can-go-back'),
  canGoForward: () => ipcRenderer.invoke('webcontents:can-go-forward'),
  loadURL: (ref: string, url: string) => ipcRenderer.invoke('webcontents:load-url', ref, url),

  // System
  getMediaAccessStatus: (mediaType: string) => ipcRenderer.invoke('system:get-media-access-status', mediaType),
  askForMediaAccess: (mediaType: string) => ipcRenderer.invoke('system:ask-for-media-access', mediaType),
  openExternal: (url: string) => ipcRenderer.invoke('system:open-external', url),

  // App menu
  addMenuItem: (menu: string, label: string, accelerator?: string) =>
    ipcRenderer.invoke('app-menu:add', menu, label, accelerator),
  refreshMenu: () => ipcRenderer.invoke('app-menu:refresh'),

  // Events (main → renderer) with unsubscribe functions
  onProtocolURL: (callback: (url: string) => void) => {
    const handler = (_event: any, url: string) => callback(url)
    ipcRenderer.on('protocol-url', handler)
    return () => ipcRenderer.removeListener('protocol-url', handler)
  },
  onNavigate: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('did-navigate-in-page', handler)
    return () => ipcRenderer.removeListener('did-navigate-in-page', handler)
  },
  onActivate: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('app:activate', handler)
    return () => ipcRenderer.removeListener('app:activate', handler)
  },

  // Platform
  platform: process.platform,
})
