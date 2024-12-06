import { HTMLAttributes } from 'react'

// https://react.dev/reference/react-dom/components/common
const attributeConverstions: Partial<Record<string, keyof HTMLAttributes<any>>> = {
  spellcheck: 'spellCheck',
  class: 'className'
}

export const convertAttributes = (attrs: Record<string, string>): Record<string, string> => {
  return Object.entries(attrs).reduce((acc, [key, value]) => {
    const convertedKey = attributeConverstions[key] ?? key

    return { ...acc, [convertedKey]: value }
  }, {})
}
