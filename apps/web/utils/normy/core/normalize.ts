import { defaultConfig } from '@/utils/normy/core/default-config'
import { mergeData } from '@/utils/normy/core/merge-data'
import { Data, DataObject, DataPrimitiveArray, NormalizerConfig, UsedKeys } from '@/utils/normy/core/types'

const stipFromDeps = (data: Data, config: Required<NormalizerConfig>, root = true): Data => {
  if (Array.isArray(data)) {
    return data.map((v) => stipFromDeps(v, config)) as DataPrimitiveArray | DataObject[]
  }

  if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    const objectKey = config.getNormalizationObjectKey(data)

    if (objectKey !== undefined && root) {
      return `@@${objectKey}`
    }

    return Object.entries(data).reduce((prev, [k, v]) => {
      prev[k] = stipFromDeps(v, config)

      return prev
    }, {} as DataObject)
  }

  return data
}

export const getDependencies = (
  data: Data,
  config = defaultConfig,
  usedKeys?: UsedKeys,
  path = ''
): [DataObject[], UsedKeys] => {
  usedKeys = usedKeys || {}

  if (Array.isArray(data)) {
    return [
      (data as DataObject[]).reduce(
        (prev: DataObject[], current: Data) => [...prev, ...getDependencies(current, config, usedKeys, path)[0]],
        [] as DataObject[]
      ),
      usedKeys
    ]
  }

  if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    if (config.getNormalizationObjectKey(data) !== undefined) {
      usedKeys[path] = Object.keys(data)
    }

    return [
      Object.entries(data).reduce(
        (prev, [k, v]) => [...prev, ...getDependencies(v, config, usedKeys, `${path}.${k}`)[0]],
        config.getNormalizationObjectKey(data) !== undefined ? [data] : []
      ),
      usedKeys
    ]
  }

  return [[], usedKeys]
}

export const normalize = (data: Data, config = defaultConfig): [Data, { [objectId: string]: DataObject }, UsedKeys] => {
  const [dependencies, usedKeys] = getDependencies(data, config)

  return [
    stipFromDeps(data, config, true),
    dependencies.reduce(
      (prev, v) => {
        const key = config.getNormalizationObjectKey(v) as string

        prev[`@@${key}`] = prev[`@@${key}`]
          ? mergeData(prev[`@@${key}`], stipFromDeps(v, config, false))
          : stipFromDeps(v, config, false)

        return prev
      },
      {} as { [objectId: string]: DataObject }
    ) as {
      [objectId: string]: DataObject
    },
    usedKeys
  ]
}
