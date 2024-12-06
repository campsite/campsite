import { useMutation } from '@tanstack/react-query'

import { Gif } from '@campsite/types/generated'

export function useDownloadGif() {
  return useMutation({
    mutationFn: async (gif: Gif) => {
      const res = await fetch(gif.url, {
        headers: new Headers({ Origin: location.origin }),
        mode: 'cors'
      })
      const blob = await res.blob()

      return new File([blob], gif.description, { type: blob.type })
    }
  })
}
