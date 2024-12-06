function isEmptyNode(node: ChildNode): boolean {
  if (node.childNodes.length === 0) {
    if (node.nodeName === 'IMG' || node.nodeName.includes('-')) {
      return false
    }

    return !node.textContent?.trim()
  }

  return Array.from(node.childNodes).every(isEmptyNode)
}

function trimNodes(nodes: ChildNode[]) {
  for (const node of nodes) {
    // do not match custom elements
    if (isEmptyNode(node)) {
      node.remove()
    } else {
      break
    }
  }
}

export function trimNode<T extends Node>(node: T): T {
  const nodes = Array.from(node.childNodes)

  trimNodes(nodes)
  trimNodes(nodes.reverse())

  return node
}

/**
 * Trims empty nodes at the end of an HTML string.
 */
export function trimHtml(html: string) {
  // Create a dummy element
  const element = document.createElement('section')

  // Insert editor content
  element.innerHTML = html

  return trimNode(element).innerHTML
}
