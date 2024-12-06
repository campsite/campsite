import { Editor, Extension } from '@tiptap/core'

export interface EnterSubmitOptions {
  onSubmit?: ({ editor }: { editor: Editor }) => void
}

export const EnterSubmit = Extension.create<EnterSubmitOptions>({
  name: 'enterSubmit',

  addOptions() {
    return {
      enabled: true,
      // eslint-disable-next-line no-empty-function
      onSubmit: () => {}
    }
  },

  addKeyboardShortcuts() {
    const { onSubmit } = this.options

    return {
      'Shift-Enter': ({ editor }) => {
        // mirroring TipTap enter key handler
        // https://github.com/ueberdosis/tiptap/blob/e2ac6003fb4d90471935ed4f40b61fff7e4a0f8e/packages/core/src/extensions/keymap.ts#L49
        return editor.commands.first(({ commands }) => [
          () => commands.newlineInCode(),
          () => commands.createParagraphNear(),
          () => commands.liftEmptyBlock(),
          () => commands.splitBlock()
        ])
      },
      Enter: () => {
        onSubmit?.({ editor: this.editor })
        return !!onSubmit
      }
    }
  }
})
