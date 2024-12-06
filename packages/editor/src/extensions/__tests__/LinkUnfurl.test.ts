import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { editorTestSetup } from '../../utils/editorTestSetup'
import * as E from '../index'

editorTestSetup()

function setupEditor(content: string) {
  return new Editor({
    extensions: [E.BlockDocument, E.Text, E.Paragraph, E.LinkUnfurl],
    content
  })
}

describe('LinkUnfurl', () => {
  const SAMPLE_HREF = 'https://example.com'
  const LINK_UNFURL_BLOCK = {
    attrs: {
      href: SAMPLE_HREF
    },
    type: 'linkUnfurl'
  }

  it('inserts before the paragraph', () => {
    const editor = setupEditor('<p>Foo bar</p>')

    editor.chain().insertLinkUnfurl(SAMPLE_HREF).run()

    expect(editor.getJSON()).toEqual({
      content: [
        LINK_UNFURL_BLOCK,
        {
          content: [
            {
              text: 'Foo bar',
              type: 'text'
            }
          ],
          type: 'paragraph'
        }
      ],
      type: 'doc'
    })
  })

  it('inserts between paragraphs', () => {
    const editor = setupEditor('<p>Foo</p><p>Bar</p>')

    editor.chain().insertLinkUnfurl(SAMPLE_HREF, 4).run()

    expect(editor.getJSON()).toEqual({
      content: [
        {
          content: [
            {
              text: 'Foo',
              type: 'text'
            }
          ],
          type: 'paragraph'
        },
        LINK_UNFURL_BLOCK,
        {
          content: [
            {
              text: 'Bar',
              type: 'text'
            }
          ],
          type: 'paragraph'
        }
      ],
      type: 'doc'
    })
  })

  it('inserts after the paragraph', () => {
    const editor = setupEditor('<p>Foo bar</p>')

    editor.chain().insertLinkUnfurl(SAMPLE_HREF, 'end').run()

    expect(editor.getJSON()).toEqual({
      content: [
        {
          content: [
            {
              text: 'Foo bar',
              type: 'text'
            }
          ],
          type: 'paragraph'
        },
        LINK_UNFURL_BLOCK,
        // automatic new line when inserting at the end
        {
          type: 'paragraph'
        }
      ],
      type: 'doc'
    })
  })
})
