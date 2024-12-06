import { useCallback } from 'react'
import { useAtom } from 'jotai'
import { useFormContext, useWatch } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'

import { EMPTY_HTML } from '@/atoms/markdown'
import { commentDraftAtom } from '@/components/Comments/CommentComposer'
import { CommentSchema } from '@/components/Comments/utils/schema'
import { useBeforeRouteChange } from '@/hooks/useBeforeRouteChange'

import { useExecuteOnChange } from './useExecuteOnChange'

interface AutoSaveProps {
  draftKey: string
  enabled: boolean
}

function commentFormIsEmpty(comment: CommentSchema) {
  const emptyDescription = !comment.body_html || comment.body_html === EMPTY_HTML

  return emptyDescription && !comment.attachments.length
}

/**
 * Similar to useSavePostFormDraft, with these differences:
 * - uses `useAtom` instead of `useStoredState` for compatibility with draft reply excerpts
 * - uses `CommentSchema` instead of `PostSchema`
 * - uses a different `isEmpty` function
 *
 * I think we could make this hook generic and merge posts + comments in the future if we have posts use jotai too.
 * For now I'm using a separate hook while we handle migrating comments to use `react-hook-form`.
 */
export function useSaveCommentFormDraft({ draftKey, enabled }: AutoSaveProps) {
  const methods = useFormContext<CommentSchema>()
  const [_, setLocalDraftComment] = useAtom(commentDraftAtom(draftKey))

  const removeDraft = useCallback(() => {
    setLocalDraftComment(null)
  }, [setLocalDraftComment])

  const onSave = useCallback(() => {
    if (!enabled) return

    const data = methods.getValues()

    if (commentFormIsEmpty(data)) {
      removeDraft()
    } else {
      setLocalDraftComment({
        ...data,
        // optimistic_src, which comes from createObjectURL(), will only be useful as long as the
        // attachment is in browser memory. Exclude it from the draft in localstorage, and rely
        // on the values in attachment.url and attachment.image_urls for subsequent requests.
        // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
        attachments: data.attachments.map((attachment) => ({ ...attachment, optimistic_src: null }))
      })
    }
  }, [enabled, methods, removeDraft, setLocalDraftComment])

  // Debounce save to avoid thrashing storage
  const debouncedSave = useDebouncedCallback(onSave, 100)

  // watch the form for changes
  const values = useWatch({ control: methods.control })

  // anytime the values change, save the draft
  useExecuteOnChange(values, debouncedSave)

  // Save the draft when the route changes
  useBeforeRouteChange(onSave)

  return { removeDraft }
}
