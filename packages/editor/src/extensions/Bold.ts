import { Bold as TipTapBold } from '@tiptap/extension-bold'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export const Bold = TipTapBold.extend({
  markdownParseSpec() {
    return createMarkdownParserSpec({ mark: TipTapBold.name })
  },

  markdownToken: 'strong'
})
