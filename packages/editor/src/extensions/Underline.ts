import { Underline as TipTapUnderline } from '@tiptap/extension-underline'

export const Underline = TipTapUnderline.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-u': () => this.editor.commands.toggleUnderline()
    }
  }
})
