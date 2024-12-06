import { useCallback, useState } from 'react'

async function handleCopy(text: string) {
  if ('clipboard' in navigator) {
    return await navigator.clipboard.writeText(text)
  } else {
    return document.execCommand('copy', true, text)
  }
}

export function useCopyToClipboard(): [(text: string) => Promise<boolean>, boolean] {
  const [isCopied, setIsCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    await handleCopy(text)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 1500)
    return true
  }, [])

  return [copy, isCopied]
}
