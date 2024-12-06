const re = /[a-z0-9]/i

export function isAlphaNumeric(char: string) {
  if (char.length !== 1) return false
  return re.test(char)
}
