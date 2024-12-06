import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import { OrganizationPostLinearIssuesPostRequest, PostCommentsLinearIssuesData } from '@campsite/types'
import { useCallbackRef } from '@campsite/ui/hooks'

import { useScope } from '@/contexts/scope'
import { useBindCurrentUserEvent } from '@/hooks/useBindCurrentUserEvent'
import { apiClient } from '@/utils/queryClient'

const createCommentIssue = apiClient.organizations.postCommentsLinearIssues()

export function useCreateCommentLinearIssue({
  commentId,
  onStatusChange
}: {
  commentId: string
  onStatusChange: (data: PostCommentsLinearIssuesData) => void
}) {
  const { scope } = useScope()
  const [status, setStatus] = useState<PostCommentsLinearIssuesData['status'] | null>(null)
  const handleStatusChange = useCallbackRef(onStatusChange)

  const updateOnStatusChange = useCallback(
    (data: PostCommentsLinearIssuesData) => {
      setStatus(data.status)
      handleStatusChange(data)
    },
    [handleStatusChange]
  )

  // NOTE: the server matches this event name pattern
  let eventName = `linear-issue-create:Comment:${commentId}`

  useBindCurrentUserEvent(eventName, updateOnStatusChange)

  const createIssue = useMutation({
    mutationFn: (data: OrganizationPostLinearIssuesPostRequest) =>
      createCommentIssue.request(`${scope}`, commentId, data),
    onSuccess: (res) => {
      setStatus(res.status)
    }
  })

  const resetStatus = useCallback(() => {
    setStatus(null)
  }, [])

  return { createIssue, status, resetStatus }
}
