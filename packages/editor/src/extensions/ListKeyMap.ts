import TipTapListKeyMap from '@tiptap/extension-list-keymap'

import { handleBackspace } from '../utils/handleBackspace'

export const ListKeyMap = TipTapListKeyMap.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Backspace: ({ editor }) => {
        let handled = false

        this.options.listTypes.forEach(({ itemName, wrapperNames }) => {
          if (editor.state.schema.nodes[itemName] === undefined) {
            return
          }

          if (handleBackspace(editor, itemName, wrapperNames)) {
            handled = true
          }
        })

        return handled
      },
      'Mod-Backspace': ({ editor }) => {
        let handled = false

        this.options.listTypes.forEach(({ itemName, wrapperNames }) => {
          if (editor.state.schema.nodes[itemName] === undefined) {
            return
          }

          if (handleBackspace(editor, itemName, wrapperNames)) {
            handled = true
          }
        })

        return handled
      }
    }
  }
})
