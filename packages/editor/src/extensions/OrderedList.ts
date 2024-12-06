import { OrderedList as TipTapOrderedList } from '@tiptap/extension-ordered-list'

import { createMarkdownParserSpec, listIsTight } from '../utils/createMarkdownParser'

export const OrderedList = TipTapOrderedList.extend({
  markdownParseSpec() {
    return createMarkdownParserSpec({
      block: TipTapOrderedList.name,
      getAttrs: (token, tokens, i) => ({
        order: +token.attrGet('start')! || 1,
        tight: listIsTight(tokens, i)
      })
    })
  },

  markdownToken: 'ordered_list'
})
