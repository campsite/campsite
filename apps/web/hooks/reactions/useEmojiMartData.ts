import { useEffect, useState } from 'react'
import type { EmojiMartData } from '@emoji-mart/data'

let emojiMartData: EmojiMartData | null = null

export function useEmojiMartData() {
  const [data, setData] = useState<EmojiMartData | null>(emojiMartData)

  useEffect(() => {
    async function load() {
      const { default: data } = (await import('@emoji-mart/data')) as { default: EmojiMartData }

      emojiMartData = data
      setData(data)
    }

    if (emojiMartData) return
    load()
  }, [])

  return { data }
}
