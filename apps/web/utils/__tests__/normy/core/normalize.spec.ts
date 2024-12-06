import { describe, expect, it } from 'vitest'

import { getDependencies, normalize } from '@/utils/normy/core/normalize'

describe('getDependencies', () => {
  it('returns empty array for simple values', () => {
    expect(getDependencies('')).toEqual([[], {}])
    expect(getDependencies(1)).toEqual([[], {}])
    expect(getDependencies(false)).toEqual([[], {}])
    expect(getDependencies(null)).toEqual([[], {}])
  })

  it('returns empty array for values without ids', () => {
    expect(getDependencies({})).toEqual([[], {}])
    expect(getDependencies([])).toEqual([[], {}])
    expect(getDependencies({ nested: [1, 2, 3] })).toEqual([[], {}])
  })

  it('finds direct dependency', () => {
    expect(getDependencies({ id: 1, key: 'value' })).toEqual([
      [
        {
          id: 1,
          key: 'value'
        }
      ],
      { '': ['id', 'key'] }
    ])
  })

  it('finds nested dependency', () => {
    expect(getDependencies({ nested: { id: 1, key: 'value' } })).toEqual([
      [
        {
          id: 1,
          key: 'value'
        }
      ],
      { '.nested': ['id', 'key'] }
    ])
  })

  it('finds dependencies from array', () => {
    expect(
      getDependencies([
        { id: '1', v: 'a' },
        { id: '2', v: 'b' }
      ])
    ).toEqual([
      [
        { id: '1', v: 'a' },
        { id: '2', v: 'b' }
      ],
      { '': ['id', 'v'] }
    ])
  })

  it('finds dependencies of dependencies', () => {
    expect(getDependencies({ id: '1', v: 'a', nested: { id: '2', v: 'b' } })).toEqual([
      [
        { id: '1', v: 'a', nested: { id: '2', v: 'b' } },
        { id: '2', v: 'b' }
      ],
      { '': ['id', 'v', 'nested'], '.nested': ['id', 'v'] }
    ])
  })

  it('works for very complex cases', () => {
    expect(
      getDependencies({
        id: '1',
        v: 'a',
        nested: { id: '2', v: 'b' },
        list: [
          {
            id: '3',
            nestedInList: { id: '5', v: 'c' },
            nestedList: [{ id: '6', v: 'd' }]
          },
          {
            id: '4',
            nestedInList: { id: '5', v: 'c' },
            nestedList: [{ id: '6', v: 'd' }]
          }
        ]
      })
    ).toEqual([
      [
        {
          id: '1',
          v: 'a',
          nested: { id: '2', v: 'b' },
          list: [
            {
              id: '3',
              nestedInList: { id: '5', v: 'c' },
              nestedList: [{ id: '6', v: 'd' }]
            },
            {
              id: '4',
              nestedInList: { id: '5', v: 'c' },
              nestedList: [{ id: '6', v: 'd' }]
            }
          ]
        },
        { id: '2', v: 'b' },
        {
          id: '3',
          nestedInList: { id: '5', v: 'c' },
          nestedList: [{ id: '6', v: 'd' }]
        },
        { id: '5', v: 'c' },
        { id: '6', v: 'd' },
        {
          id: '4',
          nestedInList: { id: '5', v: 'c' },
          nestedList: [{ id: '6', v: 'd' }]
        },
        { id: '5', v: 'c' },
        { id: '6', v: 'd' }
      ],
      {
        '': ['id', 'v', 'nested', 'list'],
        '.nested': ['id', 'v'],
        '.list': ['id', 'nestedInList', 'nestedList'],
        '.list.nestedInList': ['id', 'v'],
        '.list.nestedList': ['id', 'v']
      }
    ])
  })
})

describe('normalize', () => {
  it('should do nothing when no id', () => {
    expect(normalize({ key: 'value' })).toEqual([{ key: 'value' }, {}, {}])
  })

  it('should normalize data with single id', () => {
    expect(normalize({ id: '1', key: 'value' })).toEqual([
      '@@1',
      { '@@1': { id: '1', key: 'value' } },
      { '': ['id', 'key'] }
    ])
  })

  it('should normalize data with nested single id', () => {
    expect(normalize({ k: 'v', nested: { id: '1', key: 'value' } })).toEqual([
      {
        k: 'v',
        nested: '@@1'
      },
      { '@@1': { id: '1', key: 'value' } },
      { '.nested': ['id', 'key'] }
    ])
  })

  it('should normalize data with multiple id', () => {
    expect(
      normalize({
        k: 'v',
        wrapper: {
          nested: { id: '1', key: 'value' },
          anotherNested: { deeplyNested: { id: '2', a: 1 } }
        }
      })
    ).toEqual([
      {
        k: 'v',
        wrapper: {
          nested: '@@1',
          anotherNested: { deeplyNested: '@@2' }
        }
      },
      { '@@1': { id: '1', key: 'value' }, '@@2': { id: '2', a: 1 } },
      {
        '.wrapper.nested': ['id', 'key'],
        '.wrapper.anotherNested.deeplyNested': ['id', 'a']
      }
    ])
  })

  it('should normalize data with id with nested dependent id', () => {
    expect(
      normalize({
        id: '1',
        k: 'v',
        nested: { id: '2', key: 'value' }
      })
    ).toEqual([
      '@@1',
      {
        '@@1': { id: '1', k: 'v', nested: '@@2' },
        '@@2': { id: '2', key: 'value' }
      },
      { '': ['id', 'k', 'nested'], '.nested': ['id', 'key'] }
    ])
  })

  it('should normalize data with arrays', () => {
    expect(
      normalize({
        arrayWithoutIds: [1, 2, 3],
        arrayWithIds: [
          { id: '1', k: 'a' },
          { id: '2', k: 'b' }
        ]
      })
    ).toEqual([
      {
        arrayWithoutIds: [1, 2, 3],
        arrayWithIds: ['@@1', '@@2']
      },
      { '@@1': { id: '1', k: 'a' }, '@@2': { id: '2', k: 'b' } },
      { '.arrayWithIds': ['id', 'k'] }
    ])
  })

  it('works for very complex cases', () => {
    expect(
      normalize({
        nested: {
          withoutId: { k: 'v' },
          id: '1',
          v: 'a',
          nested: { id: '2', v: 'b' },
          list: [
            {
              id: '3',
              nestedInList: { id: '5', v: 'c' },
              nestedList: [{ id: '6', v: 'd' }]
            },
            {
              id: '4',
              nestedInList: { id: '5', v: 'c' },
              nestedList: [{ id: '6', v: 'd' }]
            }
          ]
        }
      })
    ).toEqual([
      { nested: '@@1' },
      {
        '@@1': {
          withoutId: { k: 'v' },
          id: '1',
          v: 'a',
          nested: '@@2',
          list: ['@@3', '@@4']
        },
        '@@2': { id: '2', v: 'b' },
        '@@3': { id: '3', nestedInList: '@@5', nestedList: ['@@6'] },
        '@@4': {
          id: '4',
          nestedInList: '@@5',
          nestedList: ['@@6']
        },
        '@@5': { id: '5', v: 'c' },
        '@@6': { id: '6', v: 'd' }
      },
      {
        '.nested': ['withoutId', 'id', 'v', 'nested', 'list'],
        '.nested.nested': ['id', 'v'],
        '.nested.list': ['id', 'nestedInList', 'nestedList'],
        '.nested.list.nestedInList': ['id', 'v'],
        '.nested.list.nestedList': ['id', 'v']
      }
    ])
  })

  it('should merge objects with the same id', () => {
    expect(
      normalize({
        nested: { id: '1', key: 'value' },
        anotherNested: { id: '1', a: 1 }
      })
    ).toEqual([
      {
        nested: '@@1',
        anotherNested: '@@1'
      },
      { '@@1': { id: '1', key: 'value', a: 1 } },
      {
        '.nested': ['id', 'key'],
        '.anotherNested': ['id', 'a']
      }
    ])
  })

  it('should deeply merge objects with the same id', () => {
    expect(
      normalize({
        nested: { id: '1', a: 1, nested: { x: 1, y: 2 } },
        anotherNested: { id: '1', a: 3, b: 2, nested: { x: 2 } }
      })
    ).toEqual([
      {
        nested: '@@1',
        anotherNested: '@@1'
      },
      { '@@1': { id: '1', a: 3, b: 2, nested: { x: 2, y: 2 } } },
      {
        '.nested': ['id', 'a', 'nested'],
        '.anotherNested': ['id', 'a', 'b', 'nested']
      }
    ])
  })

  it('should support configurable normalization options', () => {
    expect(
      normalize(
        [
          { id: '1', key: 'a' },
          { _id: '2', key: 'b' }
        ],
        {
          getNormalizationObjectKey: (obj) =>
            obj._id && obj.key ? `${obj._id as string}${obj.key as string}` : undefined,
          devLogging: false,
          structuralSharing: true
        }
      )
    ).toEqual([[{ id: '1', key: 'a' }, '@@2b'], { '@@2b': { _id: '2', key: 'b' } }, { '': ['_id', 'key'] }])
  })
})
