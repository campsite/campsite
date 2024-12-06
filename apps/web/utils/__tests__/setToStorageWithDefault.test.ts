import { describe, expect, it } from 'vitest'

import { setToStorageWithDefault } from '../setToStorageWithDefault'

describe('setToStorageWithDefault', () => {
  it('it stores JSON', async () => {
    const ls = window.localStorage

    setToStorageWithDefault(ls, 'test', { a: 4 }, { a: 1 })
    expect(ls.getItem('test')).toEqual(JSON.stringify({ a: 4 }))
  })

  it('it removes null', async () => {
    const ls = window.localStorage

    setToStorageWithDefault(ls, 'test', null, { a: 1 })
    expect(ls.getItem('test')).toBeNull()
  })

  it('it removes initial', async () => {
    const ls = window.localStorage

    setToStorageWithDefault(ls, 'test', { a: 1 }, { a: 1 })
    expect(ls.getItem('test')).toBeNull()
  })
})
