import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import { OrganizationPostLinearIssuesPostRequest, PostPostsLinearIssuesData } from '@campsite/types'
import { useCallbackRef } from '@campsite/ui/hooks'

import { useScope } from '@/contexts/scope'
import { useBindCurrentUserEvent } from '@/hooks/useBindCurrentUserEvent'
import { apiClient } from '@/utils/queryClient'

const createPostIssue = apiClient.organizations.postPostsLinearIssues()

export function useCreatePostLinearIssue({
  postId,
  onStatusChange
}: {
  postId: string
  onStatusChange: (data: PostPostsLinearIssuesData) => void
}) {
  const { scope } = useScope()
  const [status, setStatus] = useState<PostPostsLinearIssuesData['status'] | null>(null)
  const handleStatusChange = useCallbackRef(onStatusChange)

  const updateOnStatusChange = useCallback(
    (data: PostPostsLinearIssuesData) => {
      setStatus(data.status)
      handleStatusChange(data)
    },
    [handleStatusChange]
  )

  // NOTE: the server matches this event name pattern
  let eventName = `linear-issue-create:Post:${postId}`

  useBindCurrentUserEvent(eventName, updateOnStatusChange)

  const createIssue = useMutation({
    mutationFn: (data: OrganizationPostLinearIssuesPostRequest) => createPostIssue.request(`${scope}`, postId, data),
    onSuccess: (res) => {
      setStatus(res.status)
    }
  })

  const resetStatus = useCallback(() => {
    setStatus(null)
  }, [])

  return { createIssue, status, resetStatus }
}
