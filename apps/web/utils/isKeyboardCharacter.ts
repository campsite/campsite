const re = /[a-z0-9!@#$%^&*()_+-=/:;'",<.>\\]/i

export function isKeyboardCharacter(char: string | undefined | null) {
  if (!char || char.length !== 1) return false
  return re.test(char)
}
