import { isMarkActive, isNodeActive } from '@tiptap/core'
import { EditorState } from '@tiptap/pm/state'

interface Options {
  onlyBlock?: boolean
  onlyMark?: boolean
}

export default function isInCode(state: EditorState, options?: Options): boolean {
  const { nodes, marks } = state.schema

  if (!options?.onlyMark) {
    if (nodes.codeBlock && isNodeActive(state, nodes.codeBlock)) {
      return true
    }
  }

  if (!options?.onlyBlock) {
    if (marks.code) {
      return isMarkActive(state, marks.code)
    }
  }

  return false
}
