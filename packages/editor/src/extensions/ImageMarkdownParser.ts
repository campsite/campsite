import { Extension } from '@tiptap/core'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export const ImageMarkdownParser = Extension.create({
  name: 'imageMarkdownParser',

  markdownParseSpec() {
    return createMarkdownParserSpec({
      mark: 'link',
      noCloseToken: true,
      getAttrs: (token) => ({
        href: token.attrGet('src'),
        title: token.attrGet('title') || null
      })
    })
  },

  markdownToken: 'image'
})
