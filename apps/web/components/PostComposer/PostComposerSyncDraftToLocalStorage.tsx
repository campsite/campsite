import { useCallback } from 'react'
import { useAtomValue } from 'jotai'
import { useFormContext, useWatch } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'

import { postFormIsEmpty, PostSchema } from '@/components/Post/schema'
import { usePostComposerLocalDraftActions } from '@/components/PostComposer/hooks/usePostComposerLocalDraft'
import { postComposerStateAtom, PostComposerType } from '@/components/PostComposer/utils'
import { useBeforeRouteChange } from '@/hooks/useBeforeRouteChange'
import { useExecuteOnChange } from '@/hooks/useExecuteOnChange'

function InnerPostComposerSyncDraftToLocalStorage() {
  const methods = useFormContext<PostSchema>()
  const { deleteLocalDraft, updateLocalDraft } = usePostComposerLocalDraftActions()

  const onSave = useCallback(() => {
    const data = methods.getValues()

    if (postFormIsEmpty(data)) {
      deleteLocalDraft()
    } else {
      updateLocalDraft(data)
    }
  }, [deleteLocalDraft, methods, updateLocalDraft])

  // Debounce save to avoid thrashing storage
  const debouncedSave = useDebouncedCallback(onSave, 100)

  // watch the form for changes
  const values = useWatch({ control: methods.control })

  // anytime the values change, save the draft
  useExecuteOnChange(values, debouncedSave)

  // Save the draft when the route changes
  useBeforeRouteChange(onSave)

  return null
}

export function PostComposerSyncDraftToLocalStorage() {
  const composerState = useAtomValue(postComposerStateAtom)

  const enabled = composerState?.type === PostComposerType.Draft

  if (!enabled) return null
  return <InnerPostComposerSyncDraftToLocalStorage />
}
