import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { editorTestSetup } from '../../utils/editorTestSetup'
import * as E from '../index'

editorTestSetup()

function setupEditor(content: string) {
  return new Editor({
    extensions: [E.BlockDocument, E.Text, E.Paragraph, E.MediaGallery, E.MediaGalleryItem],
    content
  })
}

describe('MediaGallery', () => {
  it('creates a gallery and adds an attachment', () => {
    const editor = setupEditor('<p></p>')

    editor.commands.insertGallery(
      'foo',
      [
        {
          id: 'foo',
          optimistic_id: 'o_foo',
          file_type: 'image',
          width: 100,
          height: 100
        },
        {
          id: 'bar',
          optimistic_id: 'o_bar',
          file_type: 'image',
          width: 100,
          height: 100
        }
      ],
      'end'
    )

    const html = editor.getHTML()
    const htmlWithStaticId = html.replace(/media-gallery id="[^"]+"/, 'media-gallery id="foo"')

    expect(htmlWithStaticId).toMatchSnapshot()
  })

  it('inserts an attachment to an existing gallery', () => {
    const editor = setupEditor(
      '<p></p><media-gallery id="foo"><media-gallery-item id="foo" optimistic_id="o_foo" file_type="image"></media-gallery-item></media-gallery>'
    )

    editor.commands.appendGalleryItem('foo', {
      id: 'bar',
      optimistic_id: 'o_bar',
      file_type: 'image',
      width: 100,
      height: 100
    })

    expect(editor.getHTML()).toMatchSnapshot()
  })

  it('updates an attachment in a gallery', () => {
    const editor = setupEditor(
      '<p></p><media-gallery id="foo"><media-gallery-item id="foo" optimistic_id="o_foo" file_type="image"></media-gallery-item></media-gallery>'
    )

    editor.commands.updateGalleryItem('o_foo', {
      id: 'bar'
    })

    expect(editor.getHTML()).toMatchSnapshot()
  })

  it('does not throw during updateGalleryItem if the gallery item does not exist', () => {
    const initialHtml =
      '<p></p><media-gallery id="foo"><media-gallery-item id="foo" optimistic_id="o_foo" file_type="image"></media-gallery-item></media-gallery>'

    const editor = setupEditor(initialHtml)

    editor.commands.updateGalleryItem('bar', {
      id: 'foo'
    })

    expect(editor.getHTML()).toEqual(initialHtml)
  })

  it('removes an attachment from a gallery', () => {
    const editor = setupEditor(
      '<p></p><media-gallery id="foo"><media-gallery-item id="foo" optimistic_id="o_foo" file_type="image"></media-gallery-item><media-gallery-item id="bar" optimistic_id="o_bar" file_type="image"></media-gallery-item></media-gallery>'
    )

    editor.commands.removeGalleryItem('o_bar')

    expect(editor.getHTML()).toMatchSnapshot()
  })

  it('does not throw during removeGalleryItem if the gallery item does not exist', () => {
    const initialHtml =
      '<p></p><media-gallery id="foo"><media-gallery-item id="foo" optimistic_id="o_foo" file_type="image"></media-gallery-item></media-gallery>'

    const editor = setupEditor(initialHtml)

    editor.commands.removeGalleryItem('o_bar')

    expect(editor.getHTML()).toEqual(initialHtml)
  })

  it('removes the gallery when there are no attachments', () => {
    const editor = setupEditor(
      '<p></p><media-gallery id="foo"><media-gallery-item id="foo" optimistic_id="o_foo" file_type="image"></media-gallery-item></media-gallery>'
    )

    editor.commands.removeGalleryItem('o_foo')

    expect(editor.getHTML()).toMatchSnapshot()
  })

  it('removes an attachment from a gallery in a post with multiple galleries', () => {
    const editor = setupEditor(
      [
        '<p></p>',
        '<media-gallery id="a"><media-gallery-item id="a1" optimistic_id="o_a1" file_type="image"></media-gallery-item><media-gallery-item id="a2" optimistic_id="o_a2" file_type="image"></media-gallery-item><media-gallery-item id="a3" optimistic_id="o_a3" file_type="image"></media-gallery-item></media-gallery>',
        '<media-gallery id="b"><media-gallery-item id="b1" optimistic_id="o_b1" file_type="image"></media-gallery-item></media-gallery>',
        '<media-gallery id="c"><media-gallery-item id="c1" optimistic_id="o_c1" file_type="image"></media-gallery-item><media-gallery-item id="c2" optimistic_id="o_c2" file_type="image"></media-gallery-item></media-gallery>',
        '<media-gallery id="d"><media-gallery-item id="d1" optimistic_id="o_d1" file_type="image"></media-gallery-item></media-gallery>'
      ].join('')
    )

    // remove item from gallery 1
    editor.commands.removeGalleryItem('o_a2')
    // remove item from gallery 2
    editor.commands.removeGalleryItem('o_b1')
    // remove item from gallery 3
    editor.commands.removeGalleryItem('o_c2')

    expect(editor.getHTML()).toMatchSnapshot()
  })

  it('updates the order of items in a gallery', () => {
    const editor = setupEditor(
      '<p></p><media-gallery id="foo"><media-gallery-item id="a" optimistic_id="o_a" file_type="image"></media-gallery-item><media-gallery-item id="b" optimistic_id="o_b" file_type="image"></media-gallery-item><media-gallery-item id="c" optimistic_id="o_c" file_type="image"></media-gallery-item><media-gallery-item id="d" optimistic_id="o_d" file_type="image"></media-gallery-item><media-gallery-item id="e" optimistic_id="o_e" file_type="image"></media-gallery-item></media-gallery>'
    )

    // in theory only one item would ever change at a time, but this function will handle multiple items at once
    editor.commands.updateGalleryOrder('foo', ['o_e', 'o_d', 'o_c', 'o_b', 'o_a'])

    expect(editor.getHTML()).toMatchSnapshot()
  })

  it('assigns optimistic ids to attachments when the html does not include them', () => {
    const editor = setupEditor(
      '<p></p><media-gallery id="foo"><media-gallery-item id="foo" file_type="image"></media-gallery-item><media-gallery-item id="bar" optimistic_id="o_bar" file_type="image"></media-gallery-item></media-gallery>'
    )

    expect(editor.getHTML()).toMatchSnapshot()
  })
})
