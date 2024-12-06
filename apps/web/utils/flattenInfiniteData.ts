import { InfiniteData } from '@tanstack/react-query'

type Identifiable = { id: string }
type DataPage<T> = {
  data: T[]
}
type Page<T> = {
  [key: string]: T[]
}

export function flattenInfiniteData<T extends { id: string }>(data?: InfiniteData<DataPage<T>>) {
  return _flattenInfiniteData('data', data)
}

function _flattenInfiniteData<T extends Identifiable, K extends keyof Page<T>>(
  dataKey: K,
  data?: InfiniteData<Page<T>>
) {
  const ids = new Set()

  return data?.pages
    .map((page) => page[dataKey])
    .flat(2)
    .filter((obj) => {
      if (ids.has(obj.id)) {
        return false
      } else {
        ids.add(obj.id)
        return true
      }
    })
}
