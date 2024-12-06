import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'

export type BlurAtTopOptions = {
  onBlur: (pos: 'restore' | 'end') => void
}

function onArrowUp(view: EditorView, event: KeyboardEvent, onBlur: BlurAtTopOptions['onBlur']) {
  if (view.state.doc.nodeSize > 0) {
    const isAtTopLine = view.coordsAtPos(view.state.selection.from).top === view.coordsAtPos(1).top

    if (isAtTopLine) {
      onBlur('restore')
      event.preventDefault()
      return true
    }
  } else {
    // doc is empty so we are at the top
    onBlur('restore')
    return true
  }
}

function onBackspace(view: EditorView, event: KeyboardEvent, onBlur: BlurAtTopOptions['onBlur']) {
  if (view.state.doc.nodeSize > 0) {
    if (
      view.state.selection.from === 1 &&
      view.state.selection.to === view.state.selection.from &&
      view.state.selection.$from.parent.type.name === 'paragraph'
    ) {
      if (view.state.selection.$from.parent.textContent.length === 0) {
        // paragraph is empty, remove it
        view.dispatch(view.state.tr.deleteRange(0, 1))
      }
      onBlur('end')
      event.preventDefault()
      return true
    }
  } else {
    // doc is empty so we are at the top
    onBlur('end')
    return true
  }
}

function BlurAtTopPlugin({ onBlur }: BlurAtTopOptions) {
  return new Plugin({
    key: new PluginKey('blurAtTop'),
    props: {
      handleKeyDown: (view, event) => {
        if (!onBlur) return false

        if (event.key === 'ArrowUp') {
          return !!onArrowUp(view, event, onBlur)
        }
        if (event.key === 'Backspace') {
          return !!onBackspace(view, event, onBlur)
        }

        return false
      }
    }
  })
}

export const BlurAtTop = Extension.create<BlurAtTopOptions>({
  name: 'blurAtTop',
  // step below the default
  priority: 99,

  addProseMirrorPlugins() {
    return [BlurAtTopPlugin(this.options)]
  }
})
