import { Attachment } from '@campsite/types'

import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

type Props = {
  attachment: Attachment | undefined
}

export function useFigmaEmbedSelected({ attachment }: Props) {
  const preference = useGetCurrentUser().data?.preferences?.figma_file_preview_mode

  return attachment?.remote_figma_url && preference !== 'image'
}
