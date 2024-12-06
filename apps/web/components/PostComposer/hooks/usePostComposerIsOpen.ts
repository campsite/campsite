import { useAtomValue } from 'jotai'

import { postComposerStateAtom } from '@/components/PostComposer/utils'

export function usePostComposerIsOpen() {
  const composerState = useAtomValue(postComposerStateAtom)

  return { isPostComposerOpen: !!composerState }
}
