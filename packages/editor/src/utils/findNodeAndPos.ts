import { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'

export function findNodeAndPos(state: EditorState, match: (node: ProseMirrorNode) => boolean) {
  let result: { pos: number; node: ProseMirrorNode } | undefined

  state.doc.descendants((node, pos) => {
    if (match(node)) {
      result = { pos, node }
      return false
    }
    return true
  })
  return result
}
