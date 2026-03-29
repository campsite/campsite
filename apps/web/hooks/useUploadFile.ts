import * as Sentry from '@sentry/nextjs'
import { useMutation } from '@tanstack/react-query'

import { PresignedPostFields } from '@campsite/types'

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

function getRequiredOrgSlug(orgSlug?: string) {
  if (!orgSlug) {
    throw new Error('Organization scope is required for this upload')
  }

  return encodeURIComponent(orgSlug)
}

function getUploadPath(resource: PresignedResource, orgSlug?: string) {
  switch (resource) {
    case 'Organization':
      return `/v1/organizations/${getRequiredOrgSlug(orgSlug)}/avatar/presigned-fields`
    case 'User':
      return '/v1/users/me/avatar/presigned-fields'
    case 'UserCoverPhoto':
      return '/v1/users/me/cover-photo/presigned-fields'
    case 'Post':
      return `/v1/organizations/${getRequiredOrgSlug(orgSlug)}/posts/presigned-fields`
    case 'Project':
      return `/v1/organizations/${getRequiredOrgSlug(orgSlug)}/project/cover-photo/presigned-fields`
    case 'FeedbackLogs':
      return `/v1/organizations/${getRequiredOrgSlug(orgSlug)}/feedback/presigned-fields`
    case 'MessageThread':
      return `/v1/organizations/${getRequiredOrgSlug(orgSlug)}/threads/presigned-fields`
    case 'OauthApplication':
      return `/v1/organizations/${getRequiredOrgSlug(orgSlug)}/oauth_applications/presigned_fields`
  }
}

async function readErrorMessage(response: Response) {
  try {
    const body = await response.clone().json()

    if (typeof body?.message === 'string' && body.message) {
      return body.message
    }
  } catch {}

  try {
    const text = await response.text()

    if (text) {
      return text
    }
  } catch {}

  return `Request failed with status ${response.status}`
}

async function getPresignedFields(path: string, type: string) {
  const url = new URL(path, window.location.origin)

  url.searchParams.set('mime_type', type)

  const response = await fetch(url.toString(), {
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return (await response.json()) as PresignedPostFields
}

function isSameHostUpload(fields: PresignedPostFields) {
  return fields.x_amz_algorithm === 'convex'
}

function getUploadName(file: Blob) {
  return file instanceof File ? file.name : 'upload'
}

export async function handleFile({ file, type, resource, orgSlug }: UploadProps) {
  const uploadPath = getUploadPath(resource, orgSlug)
  const contentType = type || 'application/octet-stream'

  if (!uploadPath) {
    throw new Error('Upload path could not be determined')
  }

  const fields = await getPresignedFields(uploadPath, contentType)

  if (isSameHostUpload(fields)) {
    const response = await fetch(fields.url, {
      method: 'POST',
      body: file,
      credentials: 'include',
      headers: {
        'Content-Type': contentType,
        'x-campsite-upload-name': getUploadName(file),
        'x-campsite-upload-size': `${file.size}`
      }
    }).catch((err) => {
      Sentry.captureException(err)
    })

    if (!response?.ok) {
      Sentry.captureException('Failed to upload file', { data: response })
      return null
    }

    const data = await response.json().catch(() => null)

    return data?.key ?? data?.url ?? null
  }

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
