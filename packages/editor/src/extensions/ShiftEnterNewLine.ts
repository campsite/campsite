import { Extension } from '@tiptap/core'
import { splitBlock } from '@tiptap/pm/commands'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    shiftEnterNewLine: {
      addNewLine: () => ReturnType
    }
  }
}

export const ShiftEnterNewLineExtension = Extension.create({
  name: 'shiftEnterNewLine',
  addCommands() {
    return {
      addNewLine:
        () =>
        ({ state, dispatch }) =>
          splitBlock(state, dispatch)
    }
  },
  addKeyboardShortcuts() {
    return {
      'Shift-Enter': () =>
        this.editor.commands.first(({ commands }) => [
          () => commands.createParagraphNear(),
          () => commands.liftEmptyBlock(),
          () => commands.splitBlock()
        ])
    }
  }
})
