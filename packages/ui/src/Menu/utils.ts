import { MenuItem } from './types'

function isTruthy<T>(value: T | null | undefined | false | 0 | ''): value is T {
  return Boolean(value)
}

function buildMenuItems(items?: (MenuItem | undefined | false | null | '')[] | false): MenuItem[] {
  if (!items) return []
  return items?.filter(isTruthy) ?? []
}

export { buildMenuItems }
