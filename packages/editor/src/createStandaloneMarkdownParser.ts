import { AnyExtension, getSchemaByResolvedExtensions } from '@tiptap/core'
import { Node as PMNode, Schema } from '@tiptap/pm/model'

import { getChatExtensions } from './chat'
import { getMarkdownExtensions } from './markdown'
import { getNoteExtensions } from './note'
import { createMarkdownParser } from './utils/createMarkdownParser'

export const ALL_EDITORS = ['chat', 'markdown', 'note'] as const

type EditorTypes = typeof ALL_EDITORS
export type EditorType = EditorTypes[number]

export function createStandaloneMarkdownParser(
  editor: EditorType,
  markdown: string,
  domParser: DOMParser,
  document: Document
): { schema: Schema<any, any>; extensions: AnyExtension[]; parsedNode: PMNode | null } {
  let extensions: AnyExtension[]

  if (editor === 'chat') {
    extensions = getChatExtensions()
  } else if (editor === 'markdown') {
    extensions = getMarkdownExtensions()
  } else {
    extensions = getNoteExtensions()
  }

  const schema = getSchemaByResolvedExtensions(extensions)

  return {
    schema,
    extensions,
    parsedNode: createMarkdownParser(schema, extensions, domParser, document).parse(markdown)
  }
}
