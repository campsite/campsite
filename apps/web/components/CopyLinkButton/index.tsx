import { useCallback } from 'react'
import { toast } from 'react-hot-toast'

import { Button, CheckIcon, LinkIcon } from '@campsite/ui'
import { useCopyToClipboard } from '@campsite/ui/src/hooks'

interface Props {
  text: string
  showLabel?: boolean
  variant?: 'base' | 'plain'
  shortcut?: string
}

export function CopyLinkButton({ text, showLabel, variant = 'base', shortcut }: Props) {
  const [copy, isCopied] = useCopyToClipboard()

  const onClick = useCallback(() => {
    copy(text)
    toast('Copied to clipboard')
  }, [copy, text])

  return (
    <Button
      iconOnly={!showLabel && (isCopied ? <CheckIcon /> : <LinkIcon />)}
      leftSlot={showLabel && (isCopied ? <CheckIcon /> : <LinkIcon />)}
      onClick={onClick}
      accessibilityLabel='Copy link to clipboard'
      variant={variant}
      tooltip='Copy link'
      tooltipShortcut={shortcut}
    >
      {showLabel && 'Copy link'}
    </Button>
  )
}
