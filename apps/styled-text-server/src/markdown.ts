import { DOMSerializer } from '@tiptap/pm/model'
import { JSDOM } from 'jsdom'

import { ALL_EDITORS, createStandaloneMarkdownParser } from '@campsite/editor'

function parseEditor(editor: string) {
  const match = ALL_EDITORS.find((e) => e === editor)

  if (match) {
    return match
  }

  throw new Error(`Invalid editor ${editor}`)
}

export function markdownToHtml(markdown: string, editor: string) {
  const dom = new JSDOM('<!DOCTYPE html><div id="content"></div>')
  const domParser = new dom.window.DOMParser()
  const document = dom.window.document
  const validEditor = parseEditor(editor)

  // Comments cause the output to terminate early; remove them
  markdown = markdown.replace(/<!--[\s\S]*?-->/g, '')

  markdown = markdown.trim()

  const { parsedNode, schema } = createStandaloneMarkdownParser(validEditor, markdown, domParser, document)

  if (!parsedNode) {
    throw new Error('Could not parse markdown')
  }

  const element = DOMSerializer.fromSchema(schema).serializeFragment(parsedNode.content, { document })
  const tempElement = document.createElement('div')

  tempElement.appendChild(element.cloneNode(true))

  return tempElement.innerHTML
}
