import { NormalizedData } from '@/utils/normy/core/types'

export const addOrRemoveDependencies = (
  dependentQueries: NormalizedData['dependentQueries'],
  objects: NormalizedData['objects'],
  queryKey: string,
  dependenciesToAdd: ReadonlyArray<string>,
  dependenciesToRemove: ReadonlyArray<string>
) => {
  dependentQueries = { ...dependentQueries }
  objects = { ...objects }

  dependenciesToAdd.forEach((dependency) => {
    if (!dependentQueries[dependency]) {
      dependentQueries[dependency] = [queryKey]
    }

    if (!dependentQueries[dependency].includes(queryKey)) {
      dependentQueries[dependency] = [...dependentQueries[dependency], queryKey]
    }
  })

  dependenciesToRemove.forEach((dependency) => {
    if (dependentQueries[dependency].length > 1) {
      dependentQueries[dependency] = dependentQueries[dependency].filter((v) => v !== queryKey)
    } else {
      delete dependentQueries[dependency]
      delete objects[dependency]
    }
  })

  return { dependentQueries, objects }
}
