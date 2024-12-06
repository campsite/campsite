import { addOrRemoveDependencies } from '@/utils/normy/core/add-or-remove-dependencies'
import { defaultConfig } from '@/utils/normy/core/default-config'
import { denormalize } from '@/utils/normy/core/denormalize'
import { getDependenciesDiff } from '@/utils/normy/core/get-dependencies-diff'
import { getQueriesDependentOnMutation } from '@/utils/normy/core/get-queries-dependent-on-mutation'
import { mergeData } from '@/utils/normy/core/merge-data'
import { normalize } from '@/utils/normy/core/normalize'
import { Data, DataObject, NormalizedData, NormalizerConfig } from '@/utils/normy/core/types'
import { warning } from '@/utils/normy/core/warning'

const initialData: NormalizedData = {
  queries: {},
  objects: {},
  dependentQueries: {}
}

const isMutationObjectDifferent = (mutationData: Data, normalizedData: Data): boolean => {
  if (Array.isArray(mutationData) && Array.isArray(normalizedData)) {
    if (mutationData.length === 0) {
      return normalizedData.length !== 0
    }

    if (mutationData.length !== normalizedData.length) {
      return true
    }

    return mutationData.some((v, i) => isMutationObjectDifferent(v, (normalizedData as Data[])[i]))
  }

  if (mutationData instanceof Date && normalizedData instanceof Date) {
    return mutationData.getTime() !== normalizedData.getTime()
  }

  if (
    mutationData !== null &&
    typeof mutationData === 'object' &&
    normalizedData !== null &&
    typeof normalizedData === 'object'
  ) {
    return Object.entries(mutationData).some(
      ([key, value]) =>
        (normalizedData as DataObject)?.[key] !== undefined &&
        isMutationObjectDifferent(value as Data, (normalizedData as DataObject)[key])
    )
  }

  return mutationData !== normalizedData
}

export const createNormalizer = (normalizerConfig?: NormalizerConfig, initialNormalizedData?: NormalizedData) => {
  const config = { ...defaultConfig, ...normalizerConfig }

  let normalizedData: NormalizedData = initialNormalizedData ?? initialData
  let currentDataReferences: Record<string, Data> = {}

  const setQuery = (queryKey: string, queryData: Data) => {
    if (config.structuralSharing) {
      if (currentDataReferences[queryKey] === queryData) {
        return
      }

      currentDataReferences[queryKey] = queryData
    }

    const [normalizedQueryData, normalizedObjectsData, usedKeys] = normalize(queryData, config)

    const { addedDependencies, removedDependencies } = getDependenciesDiff(
      normalizedData.queries[queryKey] ? normalizedData.queries[queryKey].dependencies : [],
      Object.keys(normalizedObjectsData)
    )

    normalizedData = {
      queries: {
        ...normalizedData.queries,
        [queryKey]: {
          data: normalizedQueryData,
          usedKeys,
          dependencies: Object.keys(normalizedObjectsData)
        }
      },
      ...addOrRemoveDependencies(
        normalizedData.dependentQueries,
        mergeData(normalizedData.objects, normalizedObjectsData),
        queryKey,
        addedDependencies,
        removedDependencies
      )
    }

    warning(config.devLogging, 'set query:', queryKey, '\nwith data:', queryData, '\nnormalizedData:', normalizedData)
  }

  const removeQuery = (queryKey: string) => {
    setQuery(queryKey, null)

    const queries = { ...normalizedData.queries }

    delete queries[queryKey]
    delete currentDataReferences[queryKey]

    normalizedData = {
      ...normalizedData,
      queries
    }

    warning(config.devLogging, 'removed query:', queryKey, '\nnormalizedData:', normalizedData)
  }

  const filterMutationObjects = (mutationObjects: DataObject, normalizedDataObjects: DataObject) => {
    const differentObjects: DataObject = {}

    for (const key in mutationObjects) {
      if (isMutationObjectDifferent(mutationObjects[key], normalizedDataObjects[key])) {
        differentObjects[key] = mutationObjects[key]
      }
    }

    return differentObjects
  }

  const getQueriesToUpdate = (mutationData: Data) => {
    const [, normalizedObjectsData] = normalize(mutationData, config)

    const updatedObjects = filterMutationObjects(normalizedObjectsData, normalizedData.objects)

    const normalizedDataWithMutation = mergeData(normalizedData.objects, updatedObjects)

    const foundQueries = getQueriesDependentOnMutation(normalizedData.dependentQueries, Object.keys(updatedObjects))

    return foundQueries.map((queryKey) => ({
      queryKey,
      data: denormalize(
        normalizedData.queries[queryKey].data,
        normalizedDataWithMutation,
        normalizedData.queries[queryKey].usedKeys
      )
    }))
  }

  const getQueryFragment = <T extends Data>(fragment: Data, exampleObject?: T): T | undefined => {
    let usedKeys = {}

    if (exampleObject) {
      const [, , keys] = normalize(exampleObject, config)

      usedKeys = keys
    }

    try {
      const response = denormalize(fragment, normalizedData.objects, usedKeys)

      return response as T
    } catch (error) {
      if (error instanceof RangeError) {
        warning(true, 'Recursive dependency detected. Pass example object as second argument.')

        return undefined
      }

      throw error
    }
  }

  const getObjectById = <T extends Data>(id: string, exampleObject?: T): T | undefined =>
    getQueryFragment(`@@${id}`, exampleObject)

  return {
    getNormalizedData: () => normalizedData,
    clearNormalizedData: () => {
      normalizedData = initialData
      currentDataReferences = {}
    },
    setQuery,
    removeQuery,
    getQueriesToUpdate,
    getObjectById,
    getQueryFragment
  }
}
