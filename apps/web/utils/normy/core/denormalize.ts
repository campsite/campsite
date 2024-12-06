import { Data, DataObject, DataPrimitiveArray, UsedKeys } from '@/utils/normy/core/types'

export const denormalize = (
  data: Data,
  normalizedData: { [key: string]: Data },
  usedKeys: UsedKeys,
  path = ''
): Data => {
  if (typeof data === 'string' && data.startsWith('@@')) {
    return denormalize(normalizedData[data], normalizedData, usedKeys, path)
  } else if (Array.isArray(data)) {
    return data.map((value) => denormalize(value, normalizedData, usedKeys, path)) as DataPrimitiveArray | DataObject[]
  } else if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    const objectEntries = usedKeys[path]
      ? Object.entries(data).filter(([k]) => usedKeys[path].includes(k))
      : Object.entries(data)

    return objectEntries.reduce((prev, [k, v]) => {
      prev[k] = denormalize(v, normalizedData, usedKeys, `${path}.${k}`)

      return prev
    }, {} as DataObject)
  }

  return data
}
