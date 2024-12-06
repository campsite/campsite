import { useLayoutEffect } from 'react'

import { trimNode } from '@/utils/trimHtml'

export function quotableHtmlNode(range: Range) {
  const clone = range.cloneContents()

  clone.querySelectorAll('style').forEach((el) => el.remove())
  clone.querySelectorAll('script').forEach((el) => el.remove())

  return trimNode(clone)
}

export function quotableHtmlString(range: Range) {
  const node = quotableHtmlNode(range)
  const div = document.createElement('div')

  div.appendChild(node)

  const trimmed = div.innerHTML

  if (trimmed.startsWith('<p>')) {
    return trimmed
  } else if (trimmed.startsWith('<li>')) {
    const lis = trimmed.match(/<li>/g)?.length

    // if there are multiple lis, wrap them in the parent tag to retain list type
    if (lis && lis > 1) {
      const parent = range.commonAncestorContainer

      if (parent instanceof HTMLElement) {
        const parentTag = parent?.tagName.toLowerCase()

        return `<${parentTag}>${trimmed}</${parentTag}>`
      }
    } else {
      return trimmed.replace(/^<li>/, '').replace(/<\/li>$/, '')
    }
  }

  return trimmed
}

export function useTextSelection({
  container,
  onTextSelected,
  onTextUnselected
}: {
  container: HTMLElement | null
  onTextSelected: (range: Range) => void
  onTextUnselected: () => void
}) {
  useLayoutEffect(() => {
    const handler = () => {
      const selection = window.getSelection()
      const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : undefined

      if (!selection?.isCollapsed && range && !range?.collapsed) {
        if (container && container.contains(range.commonAncestorContainer)) {
          onTextSelected(range)
        }
      } else {
        onTextUnselected()
      }
    }

    document.addEventListener('selectionchange', handler)
    window.addEventListener('resize', handler, { passive: true })

    return () => {
      document.removeEventListener('selectionchange', handler)
      window.removeEventListener('resize', handler)
    }
  }, [container, onTextSelected, onTextUnselected])
}
