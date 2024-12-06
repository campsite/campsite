import { describe, expect, it } from 'vitest'

import { getDependenciesDiff } from '@/utils/normy/core/get-dependencies-diff'

describe('getDependenciesDiff', () => {
  it('returns no diff for the same dependencies', () => {
    expect(getDependenciesDiff(['x', 'y'], ['x', 'y'])).toEqual({
      addedDependencies: [],
      removedDependencies: []
    })
  })

  it('calculates removed dependencies correctly', () => {
    expect(getDependenciesDiff(['x', 'y', 'z'], ['x'])).toEqual({
      addedDependencies: [],
      removedDependencies: ['y', 'z']
    })
  })

  it('calculates added dependencies correctly', () => {
    expect(getDependenciesDiff(['x'], ['x', 'y', 'z'])).toEqual({
      addedDependencies: ['y', 'z'],
      removedDependencies: []
    })
  })

  it('calculates added and removed dependencies at the same time', () => {
    expect(getDependenciesDiff(['x', 'y'], ['x', 'z'])).toEqual({
      addedDependencies: ['z'],
      removedDependencies: ['y']
    })
  })
})
