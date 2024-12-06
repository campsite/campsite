import { useMemo } from 'react'
import { isMacOs, isMobile } from 'react-device-detect'

import { UIText } from '../Text'
import { cn } from '../utils'

export function getShortcutKeySymbol(key: string) {
  switch (key) {
    case 'mod':
    case 'meta':
      if (isMacOs) {
        return { text: '⌘', emoji: true }
      } else {
        return { text: 'Ctrl' }
      }
    case 'alt':
      if (isMacOs) {
        return { text: '⌥', emoji: true }
      } else {
        return { text: 'Alt' }
      }
    case 'shift':
      return { text: '⇧', emoji: true }
    case 'comma':
      return { text: ',' }
    case 'return':
    case 'enter':
      return { text: 'Enter' }
    case 'backspace':
      return { text: '⌫', emoji: true }
    default:
      return { text: key.trim().toUpperCase() }
  }
}

export function KeyboardShortcut({ shortcut }: { shortcut: string[] | string }) {
  const components = useMemo(() => {
    let parts: string[]

    if (typeof shortcut === 'string') {
      if (shortcut !== '+') {
        parts = shortcut.split('+')
      } else {
        parts = ['+']
      }
    } else {
      parts = shortcut
    }

    return parts.map((key) => {
      const { text, emoji } = getShortcutKeySymbol(key)

      return (
        <UIText
          secondary
          key={key}
          size='text-xs'
          weight='font-semibold'
          className={cn({
            'font-[emoji]': emoji,
            'font-mono': !emoji
          })}
        >
          {text}
        </UIText>
      )
    })
  }, [shortcut])

  if (isMobile) return null

  return (
    <div className='flex items-baseline justify-center gap-1 rounded bg-black/5 px-1.5 py-0.5 align-middle text-[10px] dark:bg-white/10 dark:shadow-[inset_0_0.5px_0_rgba(255,255,255,0.12)]'>
      {components}
    </div>
  )
}
