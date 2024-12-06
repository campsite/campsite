// https://discuss.prosemirror.net/t/how-to-autojoin-all-the-time/2957/4

import { NodeType } from '@tiptap/pm/model'
import { Transaction } from '@tiptap/pm/state'
import { canJoin } from '@tiptap/pm/transform'

// Ripped out from prosemirror-commands wrapDispatchForJoin
export function autoJoin({
  prevTr,
  nextTr,
  nodeTypes
}: {
  prevTr: Transaction
  nextTr: Transaction
  nodeTypes: NodeType[]
}) {
  // Find all ranges where we might want to join.
  let ranges: Array<number> = []

  for (let i = 0; i < prevTr.mapping.maps.length; i++) {
    let map = prevTr.mapping.maps[i]

    if (!map) continue
    for (let j = 0; j < ranges.length; j++) ranges[j] = map.map(ranges[j]!)
    map.forEach((_s, _e, from, to) => ranges.push(from, to))
  }

  // Figure out which joinable points exist inside those ranges,
  // by checking all node boundaries in their parent nodes.
  let joinable: number[] = []

  for (let i = 0; i < ranges.length; i += 2) {
    let from = ranges[i],
      to = ranges[i + 1]
    let $from = prevTr.doc.resolve(from!),
      depth = $from.sharedDepth(to!),
      parent = $from.node(depth)

    for (let index = $from.indexAfter(depth), pos = $from.after(depth + 1); pos <= to!; ++index) {
      let after = parent.maybeChild(index)

      if (!after) {
        break
      }
      if (index && joinable.indexOf(pos) == -1) {
        let before = parent.child(index - 1)

        if (before.type == after.type && nodeTypes.includes(before.type)) {
          joinable.push(pos as number)
        }
      }
      pos += after.nodeSize
    }
  }

  let joined = false

  // Join the joinable points
  joinable.sort((a, b) => a - b)
  for (let i = joinable.length - 1; i >= 0; i--) {
    if (canJoin(prevTr.doc, joinable[i]!)) {
      nextTr.join(joinable[i]!)
      joined = true
    }
  }

  return joined
}
