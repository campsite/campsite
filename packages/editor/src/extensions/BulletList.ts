import { BulletList as TipTapBulletList } from '@tiptap/extension-bullet-list'

import { createMarkdownParserSpec, listIsTight } from '../utils/createMarkdownParser'

export const BulletList = TipTapBulletList.extend({
  markdownParseSpec() {
    return createMarkdownParserSpec({
      block: TipTapBulletList.name,
      getAttrs: (_, tokens, i) => ({ tight: listIsTight(tokens, i) })
    })
  },

  markdownToken: 'bullet_list'
})
