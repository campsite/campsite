import { Blockquote as TipTapBlockquote } from '@tiptap/extension-blockquote'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export const Blockquote = TipTapBlockquote.extend({
  markdownParseSpec() {
    return createMarkdownParserSpec({ block: TipTapBlockquote.name })
  }
})
