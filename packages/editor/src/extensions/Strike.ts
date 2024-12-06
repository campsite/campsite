import { Strike as TipTapStrike } from '@tiptap/extension-strike'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export const Strike = TipTapStrike.extend({
  markdownParseSpec() {
    return createMarkdownParserSpec({ mark: TipTapStrike.name })
  },

  markdownToken: 's'
})
