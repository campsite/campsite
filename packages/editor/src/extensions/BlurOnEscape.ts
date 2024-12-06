import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const BlurOnEscape = Extension.create({
  name: 'blurOnEscape',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('blurOnEscape'),
        props: {
          handleKeyDown: (_view, event) => {
            if (event.key === 'Escape') {
              event.preventDefault()
              event.stopPropagation()
              this.editor.commands.blur()
            }
          }
        }
      })
    ]
  }
})
