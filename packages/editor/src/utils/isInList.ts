import { EditorState } from '@tiptap/pm/state'

export default function isInList(state: EditorState) {
  const $head = state.selection.$head

  for (let d = $head.depth; d > 0; d--) {
    if (['orderedList', 'bulletList', 'taskList'].includes($head.node(d).type.name)) {
      return true
    }
  }

  return false
}
