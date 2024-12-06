import { useAtomValue } from 'jotai'

import { commentDraftAtom } from '@/components/Comments/CommentComposer'
import { commentDefaultValues, CommentSchema } from '@/components/Comments/utils/schema'

/**
 * Handles our migration from storing just body_html to storing the full comment form schema.
 */
export function useCommentLocalDraft(draftKey: string): CommentSchema | null {
  const content = useAtomValue(commentDraftAtom(draftKey))

  if (!content) return null

  if (typeof content === 'string') {
    return { ...commentDefaultValues, body_html: content }
  }

  return content
}
