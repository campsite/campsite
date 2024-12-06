import { atom, useSetAtom } from 'jotai'
import toast from 'react-hot-toast'

import { ONE_GB } from '@campsite/config/index'

import { addAttachmentAtom, updateAttachmentAtom } from '@/components/Chat/atoms'
import { useScope } from '@/contexts/scope'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useUploadHelpers } from '@/hooks/useUploadHelpers'
import { createFileUploadPipeline } from '@/utils/createFileUploadPipeline'

const serverIdToOptimisticIdAtom = atom<Map<string, string>>(new Map())
const optimisticIdToLocalSrcAtom = atom<Map<string, string>>(new Map())

export const setServerIdToOptimisticIdAtom = atom(null, (_get, set, { serverId, optimisticId }) => {
  set(serverIdToOptimisticIdAtom, (prev) => new Map(prev).set(serverId, optimisticId))
})

const setOptimisticIdToLocalSrcAtom = atom(null, (_get, set, { optimisticId, localSrc }) => {
  set(optimisticIdToLocalSrcAtom, (prev) => new Map(prev).set(optimisticId, localSrc))
})

export const getLocalSrcAtom = atom((get) => {
  const idMap = get(serverIdToOptimisticIdAtom)
  const src = get(optimisticIdToLocalSrcAtom)

  return (id: string) => {
    const optimisticId = idMap.get(id) ?? id
    const localSrc = src.get(optimisticId) ?? ''

    return localSrc
  }
})

type Props = {
  enabled?: boolean
}

export function useUploadChatAttachments(props?: Props) {
  const addAttachment = useSetAtom(addAttachmentAtom)
  const updateAttachment = useSetAtom(updateAttachmentAtom)
  const setOptimisticIdToLocalSrc = useSetAtom(setOptimisticIdToLocalSrcAtom)
  const { scope } = useScope()
  const maxFileSize = useGetCurrentOrganization({ enabled: props?.enabled }).data?.limits?.file_size_bytes || ONE_GB

  return useUploadHelpers({
    enabled: !!props?.enabled,
    upload: (files: File[]) =>
      createFileUploadPipeline({
        files,
        maxFileSize,
        scope: `${scope}`,
        onFilesExceedMaxSize: () =>
          toast.error(`File size must be less than ${Math.floor(maxFileSize / 1024 / 1024)}mb`),
        onAppend: (attachments) => {
          attachments.forEach((attachment) => {
            addAttachment(attachment)

            const localSrc = attachment.optimistic_src || attachment.optimistic_preview_src

            if (localSrc) {
              setOptimisticIdToLocalSrc({ optimisticId: attachment.optimistic_id, localSrc })
            }
          })
        },
        onUpdate: (optimisticId, value) => {
          updateAttachment({ optimisticId, value })

          const localSrc = value.optimistic_src || value.optimistic_preview_src

          if (localSrc) {
            setOptimisticIdToLocalSrc({ optimisticId, localSrc })
          }
        }
      })
  })
}
