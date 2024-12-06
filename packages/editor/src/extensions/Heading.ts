import { Heading as TipTapHeading } from '@tiptap/extension-heading'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export const Heading = TipTapHeading.extend({
  markdownParseSpec() {
    return createMarkdownParserSpec({
      block: TipTapHeading.name,
      getAttrs: (token) => ({ level: +token.tag.slice(1) })
    })
  }
})
