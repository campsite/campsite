export function pluckKeyValues<T extends { [key: string]: any }>(from: T, to: T) {
  return Object.keys(from).reduce((acc, key) => {
    return { ...acc, [key]: to[key] }
  }, {} as T)
}
