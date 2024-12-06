import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { editorTestSetup } from '../../utils/editorTestSetup'
import * as E from '../index'

editorTestSetup()

function setupEditor(content: string) {
  return new Editor({
    extensions: [E.Document, E.Text, E.Paragraph, E.Hardbreak, E.SplitNearHardBreaks, E.Heading],
    content
  })
}

describe('SplitNearHardBreaks', () => {
  describe('next br', () => {
    const EXPECT = {
      content: [
        {
          attrs: {
            level: 1
          },
          content: [
            {
              text: 'Foo bar',
              type: 'text'
            }
          ],
          type: 'heading'
        },
        {
          content: [
            {
              text: 'Cat dog',
              type: 'text'
            }
          ],
          type: 'paragraph'
        }
      ],
      type: 'doc'
    }

    it('splits with beginning empty selection', () => {
      const editor = setupEditor('<p>Foo bar<br>Cat dog</p>')
      editor.chain().setTextSelection(1).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with trailing empty selection', () => {
      const editor = setupEditor('<p>Foo bar<br>Cat dog</p>')
      editor.chain().setTextSelection(8).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with mid empty selection', () => {
      const editor = setupEditor('<p>Foo bar<br>Cat dog</p>')
      editor.chain().setTextSelection(4).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with full range selection', () => {
      const editor = setupEditor('<p>Foo bar<br>Cat dog</p>')
      editor.chain().setTextSelection({ from: 1, to: 8 }).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with full range selection including break', () => {
      const editor = setupEditor('<p>Foo bar<br>Cat dog</p>')
      editor.chain().setTextSelection({ from: 1, to: 9 }).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with mid range selection', () => {
      const editor = setupEditor('<p>Foo bar<br>Cat dog</p>')
      editor.chain().setTextSelection({ from: 3, to: 5 }).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with beginning range selection', () => {
      const editor = setupEditor('<p>Foo bar<br>Cat dog</p>')
      editor.chain().setTextSelection({ from: 1, to: 3 }).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with end range selection', () => {
      const editor = setupEditor('<p>Foo bar<br>Cat dog</p>')
      editor.chain().setTextSelection({ from: 4, to: 8 }).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })
  })

  describe('prev br', () => {
    const EXPECT = {
      content: [
        {
          content: [
            {
              text: 'Cat dog',
              type: 'text'
            }
          ],
          type: 'paragraph'
        },
        {
          attrs: {
            level: 1
          },
          content: [
            {
              text: 'Foo bar',
              type: 'text'
            }
          ],
          type: 'heading'
        }
      ],
      type: 'doc'
    }

    it('splits with beginning empty selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar</p>')
      editor.chain().setTextSelection(9).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with trailing empty selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar</p>')
      editor.chain().setTextSelection(16).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with mid empty selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar</p>')
      editor.chain().setTextSelection(12).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with full range selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar</p>')
      editor.chain().setTextSelection({ from: 9, to: 16 }).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with mid range selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar</p>')
      editor.chain().setTextSelection({ from: 10, to: 12 }).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with beginning range selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar</p>')
      editor.chain().setTextSelection({ from: 9, to: 10 }).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with end range selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar</p>')
      editor.chain().setTextSelection({ from: 12, to: 16 }).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })
  })

  describe('surround br', () => {
    const EXPECT = {
      content: [
        {
          content: [
            {
              text: 'Cat dog',
              type: 'text'
            }
          ],
          type: 'paragraph'
        },
        {
          attrs: {
            level: 1
          },
          content: [
            {
              text: 'Foo bar',
              type: 'text'
            }
          ],
          type: 'heading'
        },
        {
          content: [
            {
              text: 'Pig cow',
              type: 'text'
            }
          ],
          type: 'paragraph'
        }
      ],
      type: 'doc'
    }

    it('splits with beginning empty selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar<br>Pig cow</p>')
      editor.chain().setTextSelection(9).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with trailing empty selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar<br>Pig cow</p>')
      editor.chain().setTextSelection(16).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with mid empty selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar<br>Pig cow</p>')
      editor.chain().setTextSelection(12).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with full range selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar<br>Pig cow</p>')
      editor.chain().setTextSelection({ from: 9, to: 16 }).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with mid range selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar<br>Pig cow</p>')
      editor.chain().setTextSelection({ from: 10, to: 12 }).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with beginning range selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar<br>Pig cow</p>')
      editor.chain().setTextSelection({ from: 9, to: 10 }).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })

    it('splits with end range selection', () => {
      const editor = setupEditor('<p>Cat dog<br>Foo bar<br>Pig cow</p>')
      editor.chain().setTextSelection({ from: 12, to: 16 }).splitNearHardBreaks().toggleHeading({ level: 1 }).run()

      expect(editor.getJSON()).toEqual(EXPECT)
    })
  })
})
