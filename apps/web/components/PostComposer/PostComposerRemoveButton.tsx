import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'

import { LoadingSpinner, ThickCloseIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

interface PostComposerRemoveButtonProps {
  disabled?: boolean
  accessibilityLabel: string
  onClick?(): void
  isLoading?: boolean
}

export function PostComposerRemoveButton({
  accessibilityLabel,
  disabled,
  onClick,
  isLoading = false
}: PostComposerRemoveButtonProps) {
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setShowLoading(false)
      return
    }

    const timeout = setTimeout(() => {
      setShowLoading(true)
    }, 300)

    return () => {
      clearTimeout(timeout)
    }
  }, [isLoading])

  return (
    <button
      type='button'
      aria-label={accessibilityLabel}
      disabled={disabled}
      className={cn(
        'pointer-events-auto absolute -left-2 -top-2 z-10',
        'bg-elevated flex h-6 w-6 items-center justify-center gap-3 rounded-full border shadow-sm dark:bg-gray-700',
        'hover:border-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500',
        'focus:border-red-500 focus:bg-red-500 focus:text-white focus:ring-0',
        'group/action',
        'disabled:!opacity-0',
        'opacity-0 hover:opacity-100 focus:opacity-100 group-hover/remove-container:opacity-100 peer-hover:opacity-100',
        isMobile && 'opacity-100',
        {
          'opacity-100': showLoading
        }
      )}
      onClick={onClick}
    >
      <span className={cn('group-hover/action:hidden', { hidden: !showLoading })}>
        <LoadingSpinner />
      </span>

      <span className={cn({ 'hidden group-hover/action:block': showLoading })}>
        <ThickCloseIcon size={16} />
      </span>
    </button>
  )
}
