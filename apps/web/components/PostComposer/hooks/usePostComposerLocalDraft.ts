import { useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { PostSchema } from '@/components/Post/schema'
import { useScope } from '@/contexts/scope'
import { atomWithWebStorage } from '@/utils/atomWithWebStorage'

// ----------------------------------------------------------------------------

function normalizeDraftPost(post: PostSchema): PostSchema {
  return {
    ...post,
    // optimistic_src, which comes from createObjectURL(), will only be useful as long as the
    // attachment is in browser memory. Exclude it from the draft in localstorage, and rely
    // on the values in attachment.url and attachment.image_urls for subsequent requests.
    // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
    attachments: post.attachments.map((attachment) => ({ ...attachment, optimistic_src: null }))
  }
}

// ----------------------------------------------------------------------------

const postComposerLocalDraftAtomFamily = atomFamily((scope: string) =>
  atomWithWebStorage<PostSchema | undefined>(`${scope}:localDraftPost-dialog`, undefined)
)

function usePostComposerLocalDraftValue() {
  const { scope } = useScope()
  const localDraft = useAtomValue(postComposerLocalDraftAtomFamily(`${scope}`))

  return { localDraft }
}

function usePostComposerLocalDraftActions() {
  const { scope } = useScope()
  const setLocalDraftPost = useSetAtom(postComposerLocalDraftAtomFamily(`${scope}`))

  const updateLocalDraft = useCallback(
    (post: PostSchema) => {
      setLocalDraftPost(normalizeDraftPost(post))
    },
    [setLocalDraftPost]
  )

  const deleteLocalDraft = useCallback(() => {
    setLocalDraftPost(undefined)
  }, [setLocalDraftPost])

  return { deleteLocalDraft, updateLocalDraft }
}

// ----------------------------------------------------------------------------

function usePostComposerHasLocalDraft() {
  const { localDraft } = usePostComposerLocalDraftValue()

  return { hasLocalDraft: !!localDraft }
}

// ----------------------------------------------------------------------------

export { usePostComposerLocalDraftValue, usePostComposerLocalDraftActions, usePostComposerHasLocalDraft }
