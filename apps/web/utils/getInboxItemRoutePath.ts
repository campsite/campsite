import { FollowUp, Notification } from '@campsite/types'

import { InboxView } from '@/components/InboxItems/InboxSplitView'
import { inboxItemSubjectHash } from '@/utils/inboxItemSubjectHash'

export function getInboxItemSplitViewPath(view: InboxView, inboxItem: Notification | FollowUp) {
  return `/${inboxItem.organization_slug}/inbox/${view}?inboxItemKey=${inboxItem.inbox_key}`
}

export function getInboxItemRoutePath(inboxItem: Notification | FollowUp) {
  const hash = inboxItemSubjectHash(inboxItem)

  switch (inboxItem.target.type) {
    case 'Post': {
      const cc = inboxItem.subject.type === 'Comment' ? inboxItem.subject.id : ''

      return `/${inboxItem.organization_slug}/posts/${inboxItem.target.id}${cc ? `?cc=${cc}` : ''}${hash ? `#${hash}` : ''}`
    }

    case 'Project':
      return `/${inboxItem.organization_slug}/projects/${inboxItem.target.id}${hash ? `#${hash}` : ''}`

    case 'Note':
      return `/${inboxItem.organization_slug}/notes/${inboxItem.target.id}${hash ? `#${hash}` : ''}`

    case 'Call':
      return `/${inboxItem.organization_slug}/calls/${inboxItem.target.id}${hash ? `#${hash}` : ''}`

    default:
      throw new Error(`Invalid inbox item target type ${inboxItem.target.type}`)
  }
}
