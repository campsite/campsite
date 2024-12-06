import { Italic as TipTapItalic } from '@tiptap/extension-italic'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export const Italic = TipTapItalic.extend({
  markdownParseSpec() {
    return createMarkdownParserSpec({ mark: TipTapItalic.name })
  },

  markdownToken: 'em'
})
