import { useAtomValue } from 'jotai'

import { useKeyPress } from '@/hooks/useKeyPress'

import { zoomAtom } from './atom'

export function useCommentCursor(canComment: boolean = true) {
  const spacePressed = useKeyPress('Space')
  const { panning } = useAtomValue(zoomAtom)

  // firefox can't handle image-set, so it defaults to the @2x image size.
  // there's not an easy way to chain multiple cursor urls together that is cross-browser
  // compatible, so instead just manually override the cursor for firefox.
  // firefox is the only browser that supports window.internalerror https://caniuse.com/?search=InternalError
  // @ts-ignore
  const isFirefox = window !== undefined && !!window.InternalError

  return panning
    ? 'grabbing'
    : spacePressed || !canComment
      ? 'grab'
      : isFirefox
        ? `url("/img/comment-cursor@1x.svg") 16 32, pointer`
        : `-webkit-image-set(url("/img/comment-cursor@1x.svg") 1x, url("/img/comment-cursor@2x.svg") 2x) 13 32, pointer`
}
