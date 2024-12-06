import { NormalizedData } from '@/utils/normy/core/types'

export const getQueriesDependentOnMutation = (
  dependentQueries: NormalizedData['dependentQueries'],
  mutationDependencies: ReadonlyArray<string>
): ReadonlyArray<string> => {
  const queries: string[] = []

  mutationDependencies.forEach((dependency) => {
    if (dependentQueries[dependency]) {
      queries.push(...dependentQueries[dependency])
    }
  })

  return Array.from(new Set(queries))
}
