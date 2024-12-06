import { Paragraph as TipTapParagraph } from '@tiptap/extension-paragraph'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export const Paragraph = TipTapParagraph.extend({
  markdownParseSpec() {
    return createMarkdownParserSpec({ block: TipTapParagraph.name })
  }
})
