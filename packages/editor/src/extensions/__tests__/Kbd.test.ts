import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { editorTestSetup } from '../../utils/editorTestSetup'
import * as E from '../index'

editorTestSetup()

function setupEditor(content: string) {
  return new Editor({
    extensions: [E.Document, E.Text, E.Paragraph, E.Kbd],
    content
  })
}

describe('Kbd', () => {
  it('parses kbd html', () => {
    const editor = setupEditor('<p><kbd>Ctrl+A</kbd></p>')
    const html = editor.getHTML()

    expect(html).toBe('<p><kbd>Ctrl+A</kbd></p>')
  })
})
