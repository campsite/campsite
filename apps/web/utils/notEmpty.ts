export function notEmpty<T>(value: T | null | undefined | false | 0 | ''): value is T {
  return Boolean(value)
}
