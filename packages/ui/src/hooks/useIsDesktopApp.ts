export function isDesktopApp() {
  if (typeof window === 'undefined') {
    return false
  }

  return typeof window !== 'undefined' && 'todesktop' in window && !!window.todesktop
}

export function useIsDesktopApp() {
  return isDesktopApp()
}
