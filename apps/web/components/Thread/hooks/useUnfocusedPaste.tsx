import { useEffect } from 'react'

export function useUnfocusedPaste(onPaste: (event: React.ClipboardEvent<HTMLElement>) => void) {
  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      if (document.activeElement === document.body) {
        // typescript casting needed because React.ClipboardEvent and ClipboardEvent are not the same thing
        onPaste(event as unknown as React.ClipboardEvent<HTMLElement>)
      }
    }

    document.addEventListener('paste', handlePaste)

    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [onPaste])
}
