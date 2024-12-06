import * as Sentry from '@sentry/nextjs'
import { useMutation } from '@tanstack/react-query'

import { PresignedPostFields } from '@campsite/types'

import { apiClient } from '@/utils/queryClient'
import { PresignedResource, TransformedFile } from '@/utils/types'

type PresignedProps = {
  file: TransformedFile
  resource: PresignedResource
  orgSlug?: string
}

type UploadProps = {
  file: Blob
  type: string
  resource: PresignedResource
  orgSlug?: string
}

type OnUpload = (file: TransformedFile, key: string | null, property: 'key' | 'preview_file_path') => void

type OnError = (file: TransformedFile, error: Error) => void

export async function handleFile({ file, type, resource, orgSlug }: UploadProps) {
  let presignedFetcher: Promise<PresignedPostFields>

  if (resource === 'Organization') {
    presignedFetcher = apiClient.organizations.getAvatarPresignedFields().request({
      orgSlug: orgSlug as string,
      mime_type: type
    })
  } else if (resource === 'User') {
    presignedFetcher = apiClient.users.getMeAvatarPresignedFields().request({ mime_type: type })
  } else if (resource === 'UserCoverPhoto') {
    presignedFetcher = apiClient.users.getMeCoverPhotoPresignedFields().request({ mime_type: type })
  } else if (resource === 'Post') {
    presignedFetcher = apiClient.organizations.getPostsPresignedFields().request({
      orgSlug: orgSlug as string,
      mime_type: type
    })
  } else if (resource === 'Project') {
    presignedFetcher = apiClient.organizations.getProjectCoverPhotoPresignedFields().request({
      orgSlug: orgSlug as string,
      mime_type: type
    })
  } else if (resource === 'FeedbackLogs') {
    presignedFetcher = apiClient.organizations.getFeedbackPresignedFields().request({
      orgSlug: orgSlug as string,
      mime_type: type
    })
  } else if (resource === 'MessageThread') {
    presignedFetcher = apiClient.organizations.getThreadsPresignedFields().request({
      orgSlug: orgSlug as string,
      mime_type: type
    })
  } else if (resource === 'OauthApplication') {
    presignedFetcher = apiClient.organizations.getOauthApplicationsPresignedFields().request({
      orgSlug: orgSlug as string,
      mime_type: type
    })
  }

  const fields = await presignedFetcher!

  const formData = new FormData()

  formData.append('key', fields.key)
  formData.append('content-type', fields.content_type)
  formData.append('expires', fields.expires)
  formData.append('policy', fields.policy)
  formData.append('success_action_status', fields.success_action_status)
  formData.append('x-amz-algorithm', fields.x_amz_algorithm)
  formData.append('x-amz-credential', fields.x_amz_credential)
  formData.append('x-amz-date', fields.x_amz_date)
  formData.append('x-amz-signature', fields.x_amz_signature)
  formData.append('file', file)

  const result = await fetch(fields.url, {
    method: 'POST',
    body: formData
  }).catch((err) => {
    Sentry.captureException(err)
  })

  if (result?.ok) return fields.key

  Sentry.captureException('Failed to upload file', { data: result })

  return null
}

export function useFileUploadMutation(onUpload: OnUpload, onError: OnError, property: 'key' | 'preview_file_path') {
  return useMutation({
    mutationFn: async (data: PresignedProps) =>
      await handleFile({ file: data.file.raw, type: data.file.type, resource: data.resource, orgSlug: data.orgSlug }),
    onSuccess(data, variables) {
      onUpload(variables.file, data, property)
    },
    onError(error, variables) {
      onError(variables.file, error as Error)
    }
  })
}
