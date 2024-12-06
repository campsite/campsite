import { isMobile } from 'react-device-detect'

import { getImmediateScrollableNode } from './scroll'

export function scrollInputIntoView(containerId: string, options?: { pad?: number }) {
  const { pad = 60 } = options || {}
  const container = document.getElementById(containerId)

  if (!container) return

  const rect = container.getBoundingClientRect()
  const parent = getImmediateScrollableNode(container)

  if (isMobile) {
    // on mobile, always scroll the editor near the top of the screen.
    // this is more accurate and consistent than methods like `scrollIntoView`.
    const y = rect.top + parent.scrollTop - pad

    parent.scrollTo({ top: y, behavior: 'smooth' })
  } else {
    // on desktop, scroll to the editor only if it's offscreen
    if (rect.top < 0) {
      parent.scrollTo({ top: parent.scrollTop + rect.top - pad, behavior: 'smooth' })
    } else if (rect.bottom > parent.clientHeight - pad) {
      parent.scrollTo({ top: parent.scrollTop + rect.bottom - parent.clientHeight + pad, behavior: 'smooth' })
    }
  }
}
