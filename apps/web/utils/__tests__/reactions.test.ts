import { describe, expect, test } from 'vitest'

import { containsOnlyReactions } from '../reactions/containsOnlyReactions'

describe('containsOnlyReactions', () => {
  test('native emojis as part of text content', () => {
    expect(containsOnlyReactions('<p>🫠</p>')).toBeTruthy()
    expect(containsOnlyReactions('<p>hello 🫠 world</p>')).toBeFalsy()
    expect(containsOnlyReactions('<p>😉      😉</p>')).toBeTruthy()
    expect(containsOnlyReactions('<p>⏰💣💥</p>')).toBeTruthy()
  })

  test('custom reaction', () => {
    expect(containsOnlyReactions('<p><img data-type="reaction"></p>')).toBeTruthy()
    expect(containsOnlyReactions('<p><img data-type="reaction"><img data-type="reaction"></p>')).toBeTruthy()
    expect(containsOnlyReactions('<p><img data-type="reaction">hello<img data-type="reaction"></p>')).toBeFalsy()
    expect(containsOnlyReactions('<p><img data-type="reaction">      <img data-type="reaction"></p>')).toBeTruthy()
  })

  test('standard reactions ', () => {
    expect(containsOnlyReactions('<p><span data-type="reaction">👍</span></p>')).toBeTruthy()
    expect(
      containsOnlyReactions('<p><span data-type="reaction">👍</span><span data-type="reaction">👎</span></p>')
    ).toBeTruthy()
    expect(
      containsOnlyReactions('<p><span data-type="reaction">👍</span>hello<span data-type="reaction">👎</span></p>')
    ).toBeFalsy()
    expect(
      containsOnlyReactions('<p><span data-type="reaction">👍</span>      <span data-type="reaction">👎</span></p>')
    ).toBeTruthy()
  })

  test('mixed reactions', () => {
    expect(
      containsOnlyReactions('<p><img data-type="reaction"><span data-type="reaction">👍</span>🫠</p>')
    ).toBeTruthy()
  })
})
