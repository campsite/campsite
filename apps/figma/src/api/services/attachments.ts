import { useMutation } from '@tanstack/react-query'
import { ExportedNode, mime } from 'src/core/export'
import { useToken } from 'src/core/tokens'

import { FigmaFile, OrganizationPostAttachmentsPostRequest } from '@campsite/types/generated'

import { client } from '../client'

export interface UploadFileOptions {
  organization: string
  node: ExportedNode
}

export function useUploadFileMutation() {
  const token = useToken()

  return useMutation({
    mutationFn: async (data: UploadFileOptions) => {
      const fields = await client.organizations.getPostsPresignedFields().request(
        { orgSlug: data.organization, mime_type: mime(data.node) },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

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
      formData.append('file', new Blob([data.node.bytes], { type: mime(data.node) }))

      const response = await fetch(fields.url, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) throw new Error('Failed to upload file')

      return fields.key
    }
  })
}

export interface CreateAttachmentOptions {
  organization: string
  position: number
  postId: string
  file?: FigmaFile
  node: ExportedNode
}

export function useCreateMutation() {
  const token = useToken()
  const { mutateAsync: uploadFile } = useUploadFileMutation()

  return useMutation({
    mutationFn: async (data: CreateAttachmentOptions) => {
      const filePath = await uploadFile({ organization: data.organization, node: data.node })

      const body: OrganizationPostAttachmentsPostRequest = {
        file_type: mime(data.node),
        position: data.position,
        file_path: filePath,
        height: data.node.height,
        width: data.node.width
      }

      if (data.file) {
        body.figma_file_id = data.file.id
        body.remote_figma_node_id = data.node.id
        body.remote_figma_node_name = data.node.name
        body.remote_figma_node_type = data.node.node_type
      }

      return client.organizations.postPostsAttachments().request(data.organization, data.postId, body, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    },
    onSuccess: (data) => {
      const image = new Image()
      const thumbnail = new Image()

      // Warm the imgix cache
      image.src = data.url
      if (data.image_urls?.thumbnail_url) {
        thumbnail.src = data.image_urls?.thumbnail_url
      }
    }
  })
}
