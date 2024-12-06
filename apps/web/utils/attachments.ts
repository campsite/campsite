import { Attachment } from '@campsite/types'

export function isRenderable(attachment: Attachment) {
  return attachment.image || attachment.gif || attachment.video || attachment.lottie || attachment.link
}
