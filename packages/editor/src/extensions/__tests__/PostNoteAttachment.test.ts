import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { editorTestSetup } from '../../utils/editorTestSetup'
import * as E from '../index'

editorTestSetup()

function setupEditor(content: string) {
  return new Editor({
    extensions: [E.BlockDocument, E.Text, E.Paragraph, E.PostNoteAttachment],
    content
  })
}

describe('PostNoteAttachment', () => {
  const SAMPLE_ATTACHMENT = {
    id: 'id',
    optimistic_id: 'optimistic',
    file_type: 'image/jpg',
    width: 100,
    height: 200,
    error: null
  }

  describe('insertAttachments', () => {
    describe('selection', () => {
      it('inserts before the paragraph', () => {
        const editor = setupEditor('<p>Foo bar</p>')
        editor.chain().setTextSelection(1).insertAttachments([SAMPLE_ATTACHMENT]).run()

        expect(editor.getJSON()).toEqual({
          content: [
            {
              attrs: {
                ...SAMPLE_ATTACHMENT
              },
              type: 'postNoteAttachment'
            },
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

      it('splits paragraph', () => {
        const editor = setupEditor('<p>Foo bar</p>')
        editor.chain().setTextSelection(4).insertAttachments([SAMPLE_ATTACHMENT]).run()

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
            {
              attrs: {
                ...SAMPLE_ATTACHMENT
              },
              type: 'postNoteAttachment'
            },
            {
              content: [
                {
                  text: ' bar',
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
        editor.chain().setTextSelection(4).insertAttachments([SAMPLE_ATTACHMENT]).run()

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
            {
              attrs: {
                ...SAMPLE_ATTACHMENT
              },
              type: 'postNoteAttachment'
            },
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

      it('inserts a paragraph at tail', () => {
        const editor = setupEditor('<p>Foo bar</p>')
        editor.chain().setTextSelection(8).insertAttachments([SAMPLE_ATTACHMENT]).run()

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
            {
              attrs: {
                ...SAMPLE_ATTACHMENT
              },
              type: 'postNoteAttachment'
            },
            {
              type: 'paragraph'
            }
          ],
          type: 'doc'
        })
      })
    })

    describe('pos', () => {
      it('inserts before the paragraph', () => {
        const editor = setupEditor('<p>Foo bar</p>')
        editor.chain().insertAttachments([SAMPLE_ATTACHMENT], 0).run()

        expect(editor.getJSON()).toEqual({
          content: [
            {
              attrs: {
                ...SAMPLE_ATTACHMENT
              },
              type: 'postNoteAttachment'
            },
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

      it('splits paragraph', () => {
        const editor = setupEditor('<p>Foo bar</p>')
        editor.chain().insertAttachments([SAMPLE_ATTACHMENT], 4).run()

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
            {
              attrs: {
                ...SAMPLE_ATTACHMENT
              },
              type: 'postNoteAttachment'
            },
            {
              content: [
                {
                  text: ' bar',
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
        editor.chain().insertAttachments([SAMPLE_ATTACHMENT], 4).run()

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
            {
              attrs: {
                ...SAMPLE_ATTACHMENT
              },
              type: 'postNoteAttachment'
            },
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

      it('inserts a paragraph at tail', () => {
        const editor = setupEditor('<p>Foo bar</p>')
        editor.chain().insertAttachments([SAMPLE_ATTACHMENT], 8).run()

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
            {
              attrs: {
                ...SAMPLE_ATTACHMENT
              },
              type: 'postNoteAttachment'
            },
            {
              type: 'paragraph'
            }
          ],
          type: 'doc'
        })
      })
    })

    describe('end', () => {
      it('inserts a paragraph at tail', () => {
        const editor = setupEditor('<p>Foo bar</p>')
        editor.chain().insertAttachments([SAMPLE_ATTACHMENT], 'end').run()

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
            {
              attrs: {
                ...SAMPLE_ATTACHMENT
              },
              type: 'postNoteAttachment'
            },
            {
              type: 'paragraph'
            }
          ],
          type: 'doc'
        })
      })
    })
  })

  describe('updateAttachment', () => {
    it('updates an attachment', () => {
      const editor = setupEditor('<p>Foo bar</p>')
      editor.chain().insertAttachments([SAMPLE_ATTACHMENT], 'end').run()

      editor.commands.updateAttachment(SAMPLE_ATTACHMENT.optimistic_id, { width: 150, id: 'foo-bar' })

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
          {
            attrs: {
              ...SAMPLE_ATTACHMENT,
              width: 150,
              id: 'foo-bar'
            },
            type: 'postNoteAttachment'
          },
          {
            type: 'paragraph'
          }
        ],
        type: 'doc'
      })
    })
  })
})
