import { Button, GifIcon } from '@campsite/ui'

import { GifPicker } from '@/components/Gifs/GifPicker'

import { MarkdownEditorRef } from '../MarkdownEditor'

interface ComposerGifPickerProps {
  open?: boolean
  onOpenChange?: (value: boolean) => void
  editorRef: React.RefObject<MarkdownEditorRef>
  disabled?: boolean
}

export function ComposerGifPicker({ open, onOpenChange, editorRef, disabled }: ComposerGifPickerProps) {
  return (
    <GifPicker
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        <Button
          variant='plain'
          type='button'
          iconOnly={<GifIcon />}
          accessibilityLabel='Add GIF'
          tooltip='Add GIF'
          disabled={disabled}
        />
      }
      onGifSelect={(gif) => editorRef.current?.uploadAndAppendAttachments([gif])}
      onClose={() => editorRef.current?.focus('restore')}
    />
  )
}
