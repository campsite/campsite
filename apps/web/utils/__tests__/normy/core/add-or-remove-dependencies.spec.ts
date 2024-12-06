import { describe, expect, it } from 'vitest'

import { addOrRemoveDependencies } from '@/utils/normy/core/add-or-remove-dependencies'

describe('addOrRemoveDependencies', () => {
  it('correctly adds new dependency to a new object', () => {
    expect(addOrRemoveDependencies({}, {}, 'queryKey', ['x'], [])).toEqual({
      dependentQueries: {
        x: ['queryKey']
      },
      objects: {}
    })
  })

  it('correctly adds new dependency to an existing object', () => {
    expect(addOrRemoveDependencies({ x: ['queryKey'] }, {}, 'queryKey2', ['x'], [])).toEqual({
      dependentQueries: {
        x: ['queryKey', 'queryKey2']
      },
      objects: {}
    })
  })

  it('correctly removes a dependency', () => {
    expect(addOrRemoveDependencies({ x: ['queryKey', 'queryKey2'] }, { x: { id: 1 } }, 'queryKey', [], ['x'])).toEqual({
      dependentQueries: {
        x: ['queryKey2']
      },
      objects: { x: { id: 1 } }
    })
  })

  it('cleans after removing the last dependency of object', () => {
    expect(addOrRemoveDependencies({ x: ['queryKey'] }, { x: { id: 1 } }, 'queryKey', [], ['x'])).toEqual({
      dependentQueries: {},
      objects: {}
    })
  })
})
