import { Code as TipTapCode } from '@tiptap/extension-code'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export const Code = TipTapCode.extend({
  excludes: 'bold italic underline strike',

  addAttributes() {
    return {
      ...(this.parent?.() || {}),
      spellcheck: {
        default: false
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      'Mod-Shift-c': ({ editor }) => editor.commands.toggleCode()
    }
  },

  markdownParseSpec() {
    return createMarkdownParserSpec({ mark: TipTapCode.name, noCloseToken: true })
  },

  markdownToken: 'code_inline'
})

export const CodeWithoutUnderline = Code.extend({
  excludes: 'bold italic strike',
  markdownParseSpec() {
    return createMarkdownParserSpec({ mark: TipTapCode.name, noCloseToken: true })
  },
  markdownToken: 'code_inline'
})
