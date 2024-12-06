import { Editor } from '@tiptap/core'

export function focusAtStartWithNewline(editor: Editor) {
  if (editor.state.doc.firstChild?.type.name !== 'paragraph' || editor.state.doc.firstChild?.textContent !== '') {
    const tr = editor.state.tr.insert(0, editor.schema.nodes.paragraph.create())

    editor.view.dispatch(tr)
  }
  editor.commands.focus('start', { scrollIntoView: true })
}
