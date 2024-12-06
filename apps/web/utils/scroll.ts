/**
 * Get the first scrollable parent of a node.
 *
 * @param node The node to start from.
 */
export function getImmediateScrollableNode(node: HTMLElement | null) {
  let currentNode = node

  while (currentNode) {
    if (['scroll', 'auto'].includes(getComputedStyle(currentNode).overflowY)) {
      return currentNode
    }

    currentNode = currentNode.parentElement
  }

  // we should always have a #main but this allows us to fail gracefully
  return document.getElementById('main') || document.body
}

export function scrollImmediateScrollableNodeToTop(node: HTMLElement | null) {
  getImmediateScrollableNode(node).scrollTo({ top: 0, behavior: 'smooth' })
}

export function scrollImmediateScrollableNodeToBottom(node: HTMLElement | null) {
  const el = getImmediateScrollableNode(node)

  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
}
