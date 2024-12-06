import { Attachment } from '@campsite/types'

export const stableId = (attachment: Attachment) => attachment.optimistic_id ?? attachment.id
