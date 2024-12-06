import { Extension } from '@tiptap/core'
import CodeBlock from '@tiptap/extension-code-block'

import { createMarkdownParserSpec } from '../utils/createMarkdownParser'

export const CodeFenceMarkdownParser = Extension.create({
  name: 'codeFenceMarkdownParser',

  markdownParseSpec() {
    return createMarkdownParserSpec({
      block: CodeBlock.name,
      getAttrs: (token) => ({ params: token.info || '' }),
      noCloseToken: true
    })
  },

  markdownToken: 'fence'
})
