import { useEffect } from 'react'

import { isAlphaNumeric } from '@/utils/isAlphaNumeric'
import { isKeyboardCharacter } from '@/utils/isKeyboardCharacter'

const DISABLED_TAGS = ['INPUT', 'SELECT', 'TEXTAREA', 'DIV']

interface Options {
  exceptions?: string[]
  includeSymbols?: boolean
}

export function useAlphaNumericKeyPress(onKeyPress: (key: string) => void, opts?: Options) {
  useEffect(() => {
    function handleKeyPress(event: globalThis.KeyboardEvent) {
      const { key, target, metaKey, ctrlKey } = event

      if (opts?.exceptions?.includes(key)) return
      if (key === ' ') return
      if (metaKey || ctrlKey) return

      const isValidKey = opts?.includeSymbols ? isKeyboardCharacter(key) : isAlphaNumeric(key)

      if (!isValidKey) return

      if (DISABLED_TAGS.includes((target as HTMLElement).tagName)) return

      onKeyPress(key)
    }

    document.addEventListener('keydown', handleKeyPress)

    return (): void => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [onKeyPress, opts?.exceptions, opts?.includeSymbols])
}
