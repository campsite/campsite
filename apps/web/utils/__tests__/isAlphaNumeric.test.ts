import { describe, expect, it } from 'vitest'

import { isAlphaNumeric } from '../isAlphaNumeric'

describe('isAlphaNumeric', () => {
  it('it matches lowercase letters', async () => {
    expect(isAlphaNumeric('a')).toBe(true)
    expect(isAlphaNumeric('g')).toBe(true)
    expect(isAlphaNumeric('z')).toBe(true)
  })
  it('it matches uppercase letters', async () => {
    expect(isAlphaNumeric('A')).toBe(true)
    expect(isAlphaNumeric('G')).toBe(true)
    expect(isAlphaNumeric('Z')).toBe(true)
  })
  it('it matches numbers', async () => {
    expect(isAlphaNumeric('1')).toBe(true)
    expect(isAlphaNumeric('4')).toBe(true)
    expect(isAlphaNumeric('9')).toBe(true)
  })
  it('it does not match symbols', async () => {
    expect(isAlphaNumeric('!')).toBe(false)
    expect(isAlphaNumeric('@')).toBe(false)
    expect(isAlphaNumeric('#')).toBe(false)
    expect(isAlphaNumeric('$')).toBe(false)
    expect(isAlphaNumeric('%')).toBe(false)
    expect(isAlphaNumeric('^')).toBe(false)
    expect(isAlphaNumeric('&')).toBe(false)
    expect(isAlphaNumeric('*')).toBe(false)
    expect(isAlphaNumeric('(')).toBe(false)
    expect(isAlphaNumeric(')')).toBe(false)
    expect(isAlphaNumeric('_')).toBe(false)
    expect(isAlphaNumeric('+')).toBe(false)
    expect(isAlphaNumeric('-')).toBe(false)
    expect(isAlphaNumeric('=')).toBe(false)
    expect(isAlphaNumeric('/')).toBe(false)
    expect(isAlphaNumeric(':')).toBe(false)
    expect(isAlphaNumeric(';')).toBe(false)
    expect(isAlphaNumeric("'")).toBe(false)
    expect(isAlphaNumeric(',')).toBe(false)
    expect(isAlphaNumeric('<')).toBe(false)
    expect(isAlphaNumeric('.')).toBe(false)
    expect(isAlphaNumeric('>')).toBe(false)
    expect(isAlphaNumeric('\\')).toBe(false)
  })
  it('it does not match non-chars', () => {
    expect(isAlphaNumeric('Shift')).toBe(false)
  })
})
