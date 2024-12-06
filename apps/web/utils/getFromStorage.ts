export function getFromStorage<T>(storage: Storage | undefined, key: string, initialValue: T): T {
  try {
    const item = storage?.getItem(key)

    if (item == null) {
      return initialValue
    }
    return JSON.parse(item)
  } catch (error) {
    return initialValue
  }
}
