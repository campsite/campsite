import { Attachment } from '@campsite/types'
import { FigmaIcon, PhotoIcon, ToggleGroup } from '@campsite/ui'

import { useFigmaEmbedSelected } from '@/hooks/useFigmaEmbedSelected'
import { useUpdatePreference } from '@/hooks/useUpdatePreference'

interface Props {
  attachment: Attachment
}

export function FigmaToggleButton({ attachment }: Props) {
  const figmaEmbedSelected = useFigmaEmbedSelected({ attachment })
  const { mutate: updateUserPreference } = useUpdatePreference()

  if (!attachment.remote_figma_url) return null

  return (
    <ToggleGroup
      ariaLabel='Image or Figma embed'
      value={figmaEmbedSelected ? 'embed' : 'image'}
      onValueChange={(value) => updateUserPreference({ preference: 'figma_file_preview_mode', value })}
      items={[
        { value: 'image', label: 'Image', icon: <PhotoIcon /> },
        { value: 'embed', label: 'Figma embed', icon: <FigmaIcon /> }
      ]}
    />
  )
}
