import { describe, expect, it } from 'vitest'

import { getQueriesDependentOnMutation } from '@/utils/normy/core/get-queries-dependent-on-mutation'

describe('getQueriesDependentOnMutation', () => {
  it('returns empty array when no mutation dependencies passed', () => {
    expect(getQueriesDependentOnMutation({ x: ['query'] }, [])).toEqual([])
  })

  it('returns empty array when no dependencies found', () => {
    expect(getQueriesDependentOnMutation({ x: ['query'] }, ['y'])).toEqual([])
  })

  it('returns array with found query', () => {
    expect(getQueriesDependentOnMutation({ x: ['query'] }, ['x'])).toEqual(['query'])
  })

  it('does not duplicate queries', () => {
    expect(getQueriesDependentOnMutation({ x: ['query'], y: ['query'] }, ['x', 'y'])).toEqual(['query'])
  })

  it('can find multiple queries from one object', () => {
    expect(getQueriesDependentOnMutation({ x: ['query', 'query2'] }, ['x'])).toEqual(['query', 'query2'])
  })
})
