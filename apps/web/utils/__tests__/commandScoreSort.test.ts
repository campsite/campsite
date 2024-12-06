import { describe, expect, it } from 'vitest'

import { commandScoreSort } from '../commandScoreSort'

describe('commandScoreSort', () => {
  it('it sorts results in the right order', async () => {
    const arr = [
      { name: 'cat' },
      { name: 'dog' },
      { name: 'mouse' },
      { name: 'bird' },
      { name: 'turtle' },
      { name: 'rabbit' }
    ]
    const results = commandScoreSort(arr, 'bi', (item) => item.name).map((item) => item.name)
    const expected = ['bird', 'rabbit']

    expect(results).toEqual(expected)
  })
})
