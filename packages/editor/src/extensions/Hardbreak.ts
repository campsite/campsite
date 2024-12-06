import { HardBreak as TipTapHardbreak } from '@tiptap/extension-hard-break'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export const Hardbreak = TipTapHardbreak.extend({
  markdownParseSpec() {
    return createMarkdownParserSpec({ node: TipTapHardbreak.name })
  },

  markdownToken: 'hardbreak'
})
