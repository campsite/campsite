export function safeSetAppBadge(count: number | null | undefined) {
  if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
    const setter = navigator.setAppBadge.bind(navigator)

    setter(count || 0)
  }
}
