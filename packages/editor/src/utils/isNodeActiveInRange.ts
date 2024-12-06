import { getNodeType, NodeRange, Range } from '@tiptap/core'
import { NodeType } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'

export function isNodeActiveInRange(state: EditorState, typeOrName: NodeType | string | null, range: Range): boolean {
  if (typeof typeOrName === 'string' && !state.schema.nodes[typeOrName]) {
    return false
  }

  const { from, to } = range
  const type = typeOrName ? getNodeType(typeOrName, state.schema) : null

  const nodeRanges: NodeRange[] = []

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.isText) {
      return
    }

    const relativeFrom = Math.max(from, pos)
    const relativeTo = Math.min(to, pos + node.nodeSize)

    nodeRanges.push({
      node,
      from: relativeFrom,
      to: relativeTo
    })
  })

  const selectionRange = to - from
  const matchedNodeRanges = nodeRanges.filter((nodeRange) => {
    if (!type) {
      return true
    }

    return type.name === nodeRange.node.type.name
  })

  if (from === to) {
    return !!matchedNodeRanges.length
  }

  const finalRange = matchedNodeRanges.reduce((sum, nodeRange) => sum + nodeRange.to - nodeRange.from, 0)

  return finalRange >= selectionRange
}
