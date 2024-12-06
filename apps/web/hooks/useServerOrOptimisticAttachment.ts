import { useGetAttachment } from '@/hooks/useGetAttachment'

export function useServerOrOptimisticAttachment({ id, optimisticId }: { id: string; optimisticId?: string }) {
  // optimistic attachments are created with placeholder ids.
  // if the IDs are equal, the attachment is not done uploading.
  const didUpload = id !== optimisticId

  const { data: optimisticAttachment } = useGetAttachment(optimisticId, false)
  const { data: serverAttachment } = useGetAttachment(didUpload ? id : undefined, !optimisticAttachment)

  // by preferring the optimistic attachment we prevent flickering when switching from optimistic to server
  const attachment = optimisticAttachment ?? serverAttachment

  const isUploading = !didUpload && !attachment?.client_error

  return {
    attachment,
    isUploading,
    didUpload,
    hasServerAttachment: !!serverAttachment
  }
}
