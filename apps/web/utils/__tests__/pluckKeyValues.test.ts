import { describe, expect, it } from 'vitest'

import { pluckKeyValues } from '../pluckKeyValues'

describe('pluckKeyValues', () => {
  it('it plucks keys from one object with values of another', async () => {
    const from = {
      name: 'cat',
      age: 13,
      color: 'black'
    }
    const to = {
      name: 'dog',
      age: 10,
      color: 'black',
      weight: 10
    }
    const result = pluckKeyValues(from, to)

    expect(result.name).toEqual('dog')
    expect(result.age).toEqual(10)
    expect(result.color).toEqual('black')
  })
})
