import { describe, expect, it } from 'vitest'

import { isKeyboardCharacter } from '../isKeyboardCharacter'

describe('isKeyboardCharacter', () => {
  it('it matches lowercase letters', async () => {
    expect(isKeyboardCharacter('a')).toBe(true)
    expect(isKeyboardCharacter('g')).toBe(true)
    expect(isKeyboardCharacter('z')).toBe(true)
  })
  it('it matches uppercase letters', async () => {
    expect(isKeyboardCharacter('A')).toBe(true)
    expect(isKeyboardCharacter('G')).toBe(true)
    expect(isKeyboardCharacter('Z')).toBe(true)
  })
  it('it matches numbers', async () => {
    expect(isKeyboardCharacter('1')).toBe(true)
    expect(isKeyboardCharacter('4')).toBe(true)
    expect(isKeyboardCharacter('9')).toBe(true)
  })
  it('it matches symbols', async () => {
    expect(isKeyboardCharacter('!')).toBe(true)
    expect(isKeyboardCharacter('@')).toBe(true)
    expect(isKeyboardCharacter('#')).toBe(true)
    expect(isKeyboardCharacter('$')).toBe(true)
    expect(isKeyboardCharacter('%')).toBe(true)
    expect(isKeyboardCharacter('^')).toBe(true)
    expect(isKeyboardCharacter('&')).toBe(true)
    expect(isKeyboardCharacter('*')).toBe(true)
    expect(isKeyboardCharacter('(')).toBe(true)
    expect(isKeyboardCharacter(')')).toBe(true)
    expect(isKeyboardCharacter('_')).toBe(true)
    expect(isKeyboardCharacter('+')).toBe(true)
    expect(isKeyboardCharacter('-')).toBe(true)
    expect(isKeyboardCharacter('=')).toBe(true)
    expect(isKeyboardCharacter('/')).toBe(true)
    expect(isKeyboardCharacter(':')).toBe(true)
    expect(isKeyboardCharacter(';')).toBe(true)
    expect(isKeyboardCharacter("'")).toBe(true)
    expect(isKeyboardCharacter(',')).toBe(true)
    expect(isKeyboardCharacter('<')).toBe(true)
    expect(isKeyboardCharacter('.')).toBe(true)
    expect(isKeyboardCharacter('>')).toBe(true)
    expect(isKeyboardCharacter('\\')).toBe(true)
  })
  it('it does not match non-chars', () => {
    expect(isKeyboardCharacter('Shift')).toBe(false)
  })
})
