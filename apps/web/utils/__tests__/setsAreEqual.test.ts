import { describe, expect, it } from 'vitest'

import { setsAreEqual } from '../setsAreEqual'

describe('setsAreEqual', () => {
  it('should return true for two equal sets of numbers', () => {
    const setA = new Set([1, 2, 3])
    const setB = new Set([1, 2, 3])

    expect(setsAreEqual(setA, setB)).toBe(true)
  })

  it('should return false for two sets of different sizes', () => {
    const setA = new Set([1, 2, 3])
    const setB = new Set([1, 2])

    expect(setsAreEqual(setA, setB)).toBe(false)
  })

  it('should return false for sets with the same elements in different order', () => {
    const setA = new Set([1, 2, 3])
    const setB = new Set([3, 2, 1])

    expect(setsAreEqual(setA, setB)).toBe(false)
  })

  it('should return true for two empty sets', () => {
    const setA = new Set()
    const setB = new Set()

    expect(setsAreEqual(setA, setB)).toBe(true)
  })

  it('should return true for two equal sets of objects with the same references', () => {
    const obj1 = { id: 1 }
    const obj2 = { id: 2 }
    const setA = new Set([obj1, obj2])
    const setB = new Set([obj1, obj2])

    expect(setsAreEqual(setA, setB)).toBe(true)
  })

  it('should return false for two sets of objects with the same references in a different order', () => {
    const obj1 = { id: 1 }
    const obj2 = { id: 2 }
    const setA = new Set([obj1, obj2])
    const setB = new Set([obj2, obj1])

    expect(setsAreEqual(setA, setB)).toBe(false)
  })
})
