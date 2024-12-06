import { Attachment } from '@campsite/types'

import { DisplayType } from '@/components/InlinePost'

import { AttachmentGrid } from './AttachmentGrid'
import { FileAttachment } from './FileAttachment'

interface Props {
  postId: string
  content: string
  truncatedContent?: string
  attachments: Attachment[]
  display: DisplayType
  autoPlayVideo?: boolean
}

function contentIncludesAttachment(content: string, attachment: Attachment) {
  return (
    content.includes(`<post-attachment id="${attachment.id}"`) ||
    content.includes(`<media-gallery-item id="${attachment.id}"`)
  )
}

function getRenderableAttachments(props: Props, opts?: { isTruncated?: boolean }) {
  const { isTruncated = false } = opts ?? {}

  const renderableAttachments: Attachment[] = []
  const unrenderableAttachments: Attachment[] = []

  props.attachments
    .filter((attachment) => {
      // if the attachment doesn't appear anywhere in the full body, include it.
      // this file was attached to the post before inline attachments were introduced.
      if (!contentIncludesAttachment(props.content, attachment)) {
        return true
      }

      // if the post is truncated, include only attachments that appear beyond the truncation point.
      // posts before the truncation point will be rendered inline.
      if (isTruncated && props.truncatedContent) {
        return !contentIncludesAttachment(props.truncatedContent, attachment)
      }

      // or if the post is truncated but it doesn't have any text content, include all attachments
      if (isTruncated && !props.truncatedContent) {
        return true
      }

      // attachment is inline and the post isn't truncated; ignore
      return false
    })
    .map((attachment) => {
      if (attachment.image || attachment.gif || attachment.video || attachment.lottie) {
        renderableAttachments.push(attachment)
      } else {
        unrenderableAttachments.push(attachment)
      }
    })

  return { renderableAttachments, unrenderableAttachments }
}

/**
 * Displays a list of attachments in an appropriate format:
 *
 * - A single image is rendered as a large image
 * - Multiple media attachments are rendered in the 2x2 grid with a 'more' button
 * - Non-media attachments are listed as downloadable files
 *
 * Also includes logic for excluding attachments that are rendered inline in the post body.
 */
export function GroupedAttachments(props: Props) {
  const shouldTruncate = props.display !== 'page'

  const { renderableAttachments, unrenderableAttachments } = getRenderableAttachments(props, {
    isTruncated: shouldTruncate
  })

  if (props.attachments.length === 0) return null

  return (
    <div className='flex flex-col gap-3'>
      <AttachmentGrid attachments={renderableAttachments} postId={props.postId} autoPlayVideo={props.autoPlayVideo} />
      <UnrenderableAttachments attachments={unrenderableAttachments} />
    </div>
  )
}

function UnrenderableAttachments({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) return null

  return (
    <div className='divide-secondary flex flex-col divide-y rounded-md border'>
      {attachments.map((attachment) => (
        <FileAttachment showActions attachment={attachment} key={attachment.id} />
      ))}
    </div>
  )
}
