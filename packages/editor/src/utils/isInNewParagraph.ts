import { EditorState } from '@tiptap/pm/state'

export default function isInNewParagraph(state: EditorState) {
  return state.selection.$from.parent.type.name === 'paragraph' && state.selection.$from.parent.content.size === 0
}
