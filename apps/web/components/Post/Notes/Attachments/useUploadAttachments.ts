import { useCallback } from 'react'
import * as Sentry from '@sentry/nextjs'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { Editor } from '@tiptap/core'
import toast from 'react-hot-toast'
import { v4 as uuid } from 'uuid'

import { ONE_GB } from '@campsite/config'
import { InlineAttachmentAttributes } from '@campsite/editor/extensions'
import { Attachment } from '@campsite/types'

import { MEDIA_GALLERY_VALIDATORS } from '@/components/Post/utils'
import { useScope } from '@/contexts/scope'
import { useCreateAttachment } from '@/hooks/useCreateAttachment'
import { useCreateNoteAttachment } from '@/hooks/useCreateNoteAttachment'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { createFileUploadPipeline } from '@/utils/createFileUploadPipeline'
import { apiClient, getTypedQueryData, setTypedQueryData } from '@/utils/queryClient'

interface UpdateAttachmentOptions {
  queryClient: QueryClient
  scope: ReturnType<typeof useScope>['scope']
  id: string
  value: Partial<Attachment>
}

const getAttachmentsById = apiClient.organizations.getAttachmentsById()

export function setOptimisticAttachment({
  queryClient,
  scope,
  value
}: {
  queryClient: QueryClient
  scope: ReturnType<typeof useScope>['scope']
  value: Attachment
}) {
  setTypedQueryData(queryClient, getAttachmentsById.requestKey(`${scope}`, value.id), value)
  if (value.optimistic_id && value.optimistic_id !== value.id) {
    setTypedQueryData(queryClient, getAttachmentsById.requestKey(`${scope}`, value.optimistic_id), value)
  }
}

export function updateOptimisticAttachment({ queryClient, scope, id, value }: UpdateAttachmentOptions) {
  setTypedQueryData(queryClient, getAttachmentsById.requestKey(`${scope}`, id), (old) => {
    if (!old) return
    return {
      ...old,
      ...value
    }
  })
}

interface UploadProps {
  files: File[]
  editor: Editor
  atPosition?: boolean
  galleryId?: string
  pos?: number | 'end'
}

interface Props {
  noteId?: string
  enabled?: boolean
}

export function useUploadNoteAttachments({ noteId, enabled = true }: Props) {
  const { scope } = useScope()
  const maxFileSize = useGetCurrentOrganization({ enabled }).data?.limits?.file_size_bytes || ONE_GB
  const queryClient = useQueryClient()
  const { mutateAsync: createPostAttachment } = useCreateAttachment()
  const { mutateAsync: createNoteAttachment } = useCreateNoteAttachment(noteId || '')

  const createAttachment = noteId ? createNoteAttachment : createPostAttachment

  return useCallback(
    async ({ files, ...props }: UploadProps) => {
      if (!enabled) return

      const isMultipleFiles = files.length > 1

      const payloadIsValidGallery = files.every((file) =>
        MEDIA_GALLERY_VALIDATORS.some((validator) => validator(file.type))
      )

      const isGallery = payloadIsValidGallery && (isMultipleFiles || props.galleryId)

      let galleryId = props.galleryId

      function updateAttachment(id: string, value: Partial<InlineAttachmentAttributes>) {
        if (isGallery) {
          props.editor.commands.updateGalleryItem(id, value)
        } else {
          props.editor.commands.updateAttachment(id, value)
        }
      }

      // disallow adding invalid media types to a gallery
      if (props.galleryId && !payloadIsValidGallery) {
        toast.error('Unable to add unsupported file type to gallery')
        return
      }

      const pipeline = createFileUploadPipeline({
        files,
        maxFileSize,
        scope: `${scope}`,
        onFilesExceedMaxSize: () =>
          toast.error(`File size must be less than ${Math.floor(maxFileSize / 1024 / 1024)}mb`),
        onAppend: (attachments) => {
          // seed the RQ cache with optimistic values
          attachments.forEach((attachment) => setOptimisticAttachment({ queryClient, scope, value: attachment }))

          if (isGallery) {
            if (props.galleryId) {
              for (const attachment of attachments) {
                props.editor.commands.appendGalleryItem(props.galleryId, attachment)
              }
            } else {
              galleryId = uuid()
              props.editor.commands.insertGallery(galleryId, attachments, props.pos)
            }
          } else {
            props.editor.commands.insertAttachments(attachments, props.pos)
          }
        },
        onUpdate: (optimisticId, value) => {
          updateOptimisticAttachment({ queryClient, scope, id: optimisticId, value })

          if ('width' in value && 'height' in value) {
            updateAttachment(optimisticId, { width: value.width, height: value.height })
          }
        }
      })

      return pipeline
        .then((optimisticIds) => {
          // get all attachments from the queryClient cache by id
          const createPromises = optimisticIds.map((id, position) => {
            const latestValues = getTypedQueryData(queryClient, getAttachmentsById.requestKey(`${scope}`, id))

            if (!latestValues) return

            // likely due to an S3 error; user will need to retry
            if (!latestValues.optimistic_file_path) {
              toast.error(`Failed to upload file ${latestValues.name}. Please try again.`)
              updateAttachment(id, { error: 'Upload failed' })
              return
            }

            return createAttachment({
              position,
              file_type: latestValues.file_type,
              duration: latestValues.duration,
              height: latestValues.height,
              width: latestValues.width,
              file_path: latestValues.optimistic_file_path,
              preview_file_path: latestValues.optimistic_preview_file_path ?? '',
              name: latestValues.name,
              size: latestValues.size,
              no_video_track: latestValues.no_video_track,
              gallery_id: galleryId
            }).then((uploadedAttachment) => {
              // make sure the optimistic version is also updated
              uploadedAttachment.optimistic_id = id
              setOptimisticAttachment({ queryClient, scope, value: uploadedAttachment })
              updateAttachment(id, { id: uploadedAttachment.id })
            })
          })

          return Promise.all(createPromises)
        })
        .catch((err) => {
          toast.error('Unknown error during file upload')
          Sentry.captureException(err)
        })
    },
    [createAttachment, enabled, maxFileSize, queryClient, scope]
  )
}
