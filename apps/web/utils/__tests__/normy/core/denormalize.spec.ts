import { describe, expect, it } from 'vitest'

import { denormalize } from '@/utils/normy/core/denormalize'

describe('denormalize', () => {
  it('should not affect objects without any reference', () => {
    expect(denormalize({ key: 'value' }, {}, {})).toEqual({ key: 'value' })
    expect(denormalize('', {}, {})).toEqual('')
    expect(denormalize('x', {}, {})).toEqual('x')
    expect(denormalize(null, {}, {})).toEqual(null)
  })

  it('should handle reference in direct string', () => {
    expect(
      denormalize(
        '@@1',
        {
          '@@1': {
            id: '1',
            a: 'b',
            extra: 1
          }
        },
        { '': ['id', 'a'] }
      )
    ).toEqual({
      id: '1',
      a: 'b'
    })
  })

  it('should handle single reference in object', () => {
    expect(
      denormalize({ key: 'value', ref: '@@1' }, { '@@1': { id: '1', a: 'b', extra: 1 } }, { '.ref': ['id', 'a'] })
    ).toEqual({ key: 'value', ref: { id: '1', a: 'b' } })
  })

  it('should handle multiple references', () => {
    expect(
      denormalize(
        { key: 'value', ref: '@@1', nested: { k: 'v', anotherRef: '@@2' } },
        {
          '@@1': { id: '1', a: 'b', extra: 1 },
          '@@2': { id: '2', c: 'd', extra: 1 }
        },
        { '.ref': ['id', 'a'], '.nested.anotherRef': ['id', 'c'] }
      )
    ).toEqual({
      key: 'value',
      ref: { id: '1', a: 'b' },
      nested: { k: 'v', anotherRef: { id: '2', c: 'd' } }
    })
  })

  it('should handle reference nested in another references', () => {
    expect(
      denormalize(
        { key: 'value', ref: '@@1' },
        {
          '@@1': { id: '1', nested: '@@2', extra: 1 },
          '@@2': { id: '2', c: 'd', extra: 1 }
        },
        { '.ref': ['id', 'nested'], '.ref.nested': ['id', 'c'] }
      )
    ).toEqual({
      key: 'value',
      ref: { id: '1', nested: { id: '2', c: 'd' } }
    })
  })

  it('should handle arrays', () => {
    expect(
      denormalize(
        { x: 1, flat: ['@@1', '@@2'], nested: [{ x: '@@1' }, { x: '@@2' }] },
        {
          '@@1': { id: '1', nested: '@@3' },
          '@@2': { id: '2', nested: '@@4' },
          '@@3': { id: '3', x: 1, extra: 1 },
          '@@4': { id: '4', x: 2, extra: 2 }
        },
        {
          '.flat': ['id'],
          '.nested.x': ['id', 'nested'],
          '.nested.x.nested': ['id', 'x']
        }
      )
    ).toEqual({
      x: 1,
      flat: [{ id: '1' }, { id: '2' }],
      nested: [{ x: { id: '1', nested: { id: '3', x: 1 } } }, { x: { id: '2', nested: { id: '4', x: 2 } } }]
    })
  })

  it('should handle one to one relationships', () => {
    expect(
      denormalize(
        ['@@1', '@@2', '@@3'],
        {
          '@@1': { id: '1', bestFriend: '@@2', extra: 1 },
          '@@2': { id: '2', bestFriend: '@@1', extra: 1 },
          '@@3': { id: '3', bestFriend: '@@3', extra: 1 }
        },
        { '': ['id', 'bestFriend'], '.bestFriend': ['id'] }
      )
    ).toEqual([
      { id: '1', bestFriend: { id: '2' } },
      { id: '2', bestFriend: { id: '1' } },
      { id: '3', bestFriend: { id: '3' } }
    ])
  })
})
