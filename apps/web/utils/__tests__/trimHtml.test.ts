import { describe, expect, it } from 'vitest'

import { trimHtml } from '../trimHtml'

describe('trimHtml', () => {
  it('trims empty paragraph', () => {
    expect(trimHtml('<p></p>')).toEqual('')
  })

  it('trims trailing empty paragraphs', () => {
    expect(trimHtml('<p>hello</p><p></p><p></p>')).toEqual('<p>hello</p>')
  })

  it("doesn't trim paragraphs with text content", () => {
    expect(trimHtml('<p>hello</p>')).toEqual('<p>hello</p>')
    expect(trimHtml('<p><span>hello</span></p>')).toEqual('<p><span>hello</span></p>')
  })

  it("doesn't trim paragraphs that contain only images", () => {
    expect(trimHtml('<p><img src="https://campsite.com/photo.jpg" alt="photo"></p>')).toEqual(
      '<p><img src="https://campsite.com/photo.jpg" alt="photo"></p>'
    )
  })

  it("doesn't trim custom elements", () => {
    expect(trimHtml('<post-attachment id="0b2qkhkyba04"></post-attachment>')).toEqual(
      '<post-attachment id="0b2qkhkyba04"></post-attachment>'
    )
  })

  it("doesn't trim paragraphs that contain only custom elements", () => {
    expect(trimHtml('<p><post-attachment id="0b2qkhkyba04"></post-attachment></p>')).toEqual(
      '<p><post-attachment id="0b2qkhkyba04"></post-attachment></p>'
    )
  })
})
