import { useAtomValue } from 'jotai'

import { postComposerStateAtom, PostComposerType } from '@/components/PostComposer/utils'

export function usePostComposerIsEditingPost() {
  const composerState = useAtomValue(postComposerStateAtom)

  if (composerState?.type === PostComposerType.EditPost || composerState?.type === PostComposerType.EditDraftPost) {
    return {
      isEditingPost: true,
      initialPost: composerState?.initialPost
    }
  }

  return {
    isEditingPost: false,
    post: undefined
  }
}
