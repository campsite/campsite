import { useMemo, useState } from 'react'
import { Extension } from '@tiptap/react'

import { getMarkdownExtensions } from '@campsite/editor'

import { PostAttachmentLightbox } from '@/components/AttachmentLightbox/PostAttachmentLightbox'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { TaskItemOptions } from '@/components/RichTextRenderer/handlers/TaskItem'

interface InlinePostRendererProps {
  postId: string
  content?: string
  onCheckboxClick?: TaskItemOptions['onCheckboxClick']
}

export function InlinePostRenderer(props: InlinePostRendererProps) {
  const { postId, content = '', onCheckboxClick } = props

  const [selectedPostAttachmentId, setSelectedPostAttachmentId] = useState<string | undefined>()
  const options = useMemo(() => {
    return {
      mediaGallery: { onOpenAttachment: setSelectedPostAttachmentId },
      postNoteAttachment: { onOpenAttachment: setSelectedPostAttachmentId },
      taskItem: { onCheckboxClick }
    }
  }, [onCheckboxClick])

  const extensions = useMemo(() => {
    return getMarkdownExtensions({ linkUnfurl: {} }) as Extension[]
  }, [])

  return (
    <div className='prose select-text focus:outline-none'>
      <PostAttachmentLightbox
        postId={postId}
        selectedAttachmentId={selectedPostAttachmentId}
        setSelectedAttachmentId={setSelectedPostAttachmentId}
      />

      <RichTextRenderer content={content} extensions={extensions} options={options} />
    </div>
  )
}
