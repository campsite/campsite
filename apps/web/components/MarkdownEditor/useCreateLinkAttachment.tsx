import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ChainedCommands, Editor } from '@tiptap/core'
import { v4 as uuid } from 'uuid'

import { FigmaFileAttachmentDetails } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { useCreateAttachment } from '@/hooks/useCreateAttachment'
import { useCreateFigmaFileAttachment } from '@/hooks/useCreateFigmaFileAttachment'
import { useGetFigmaIntegration } from '@/hooks/useGetFigmaIntegration'
import { createOptimisticAttachment } from '@/utils/createFileUploadPipeline'

import { setOptimisticAttachment, updateOptimisticAttachment } from '../Post/Notes/Attachments/useUploadAttachments'
import { embedType } from '../Post/PostEmbeds/transformUrl'

/**
 * Creates link attachments, which are URL-based inline attachments that are capable of displaying rich metadata.
 * For example, we fetch a thumbnail and some other metadata for Figma URLs.
 */
export function useCreateLinkAttachment() {
  const { scope } = useScope()
  const { mutateAsync: createFigmaFileAttachment } = useCreateFigmaFileAttachment()
  const { refetch: refetchFigmaIntegration } = useGetFigmaIntegration()
  const queryClient = useQueryClient()

  const { mutateAsync: createAttachment } = useCreateAttachment()

  /**
   * 1. Create a base optimistic attachment object and insert into the editor
   * 2. Attempt to fetch rich metadata based on the link type, like a thumbnail or Figma metadata
   * 3. Prepare the attachment as either an image or a link
   * 4. Make an API request to create the attachment and append the ID to the form
   */
  const createLink = useCallback(
    async ({ url, editor, chain }: { url: string; editor: Editor; chain: () => ChainedCommands }) => {
      const clientId = uuid()

      let details: FigmaFileAttachmentDetails | null = null

      const tempAttachment = createOptimisticAttachment({
        id: clientId,
        optimistic_id: clientId,
        optimistic_file_path: null
      })

      setOptimisticAttachment({ queryClient, scope, value: tempAttachment })

      chain().insertAttachments([tempAttachment])

      switch (embedType(url)) {
        case 'figma':
          tempAttachment.remote_figma_url = url

          if (await refetchFigmaIntegration().then((res) => !!res?.data?.has_figma_integration)) {
            updateOptimisticAttachment({
              id: tempAttachment.id,
              queryClient,
              scope,
              value: { ...tempAttachment, image: true }
            })

            details = await createFigmaFileAttachment({ figma_file_url: url })
          }

          break

        default:
          break
      }

      // fetching rich metadata failed; prepare as link attachment
      if (!details) {
        tempAttachment.link = true
        tempAttachment.image = false
        tempAttachment.file_type = 'link'
        tempAttachment.optimistic_file_path = 'link'
      }

      const attachment = await createAttachment({
        ...tempAttachment,
        ...(details ?? {}),
        file_path: details?.file_path || url
      })

      setOptimisticAttachment({
        queryClient,
        scope,
        value: {
          ...attachment,
          optimistic_id: tempAttachment.id
        }
      })

      editor.commands.updateAttachment(tempAttachment.id, attachment)
    },
    [queryClient, scope, createAttachment, refetchFigmaIntegration, createFigmaFileAttachment]
  )

  return createLink
}
