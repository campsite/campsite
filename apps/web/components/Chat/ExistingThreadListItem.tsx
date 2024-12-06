import { useState } from 'react'
import Router, { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'

import { MessageThread } from '@campsite/types'
import { Link, RelativeTime, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { useGetMessages } from '@/hooks/useGetMessages'
import { useMarkThreadRead } from '@/hooks/useMarkThreadRead'

import { ThreadAvatar } from '../ThreadAvatar'

interface Props {
  thread: MessageThread
  isSelected?: boolean
}

export function ExistingThreadListItem({ thread, isSelected = false }: Props) {
  const router = useRouter()
  const isChatPage = router.pathname.startsWith('/[org]/chat')
  const [hovering, setHovering] = useState(false)
  const { mutate: markThreadRead } = useMarkThreadRead()

  // prefetch message cache on hover
  useGetMessages({ threadId: thread.id, enabled: hovering })

  return (
    <Link
      href={`/${thread.organization_slug}/chat/${thread.id}`}
      className={cn(
        'dark:focus:bg-tertiary group relative flex w-full flex-none scroll-mt-12 items-center gap-3 rounded-lg py-3 pl-2 pr-4 focus-within:border-none focus-within:outline-none focus-within:ring-0 focus:border-none focus:outline-none focus:ring-0',
        {
          'bg-tertiary': isSelected,
          'hover:bg-tertiary': !isSelected
        }
      )}
      onMouseOver={() => setHovering(true)}
      onMouseOut={() => setHovering(false)}
      onClick={(e) => {
        markThreadRead({ threadId: thread.id })

        // if the user isn't on the Messages split view page, like viewing the Messages hover card,
        // then we can use the plain href in the link to navigate. otherwise, if they
        // are on the Messages split view, we do shallow routing with masking to prevent scroll
        // jank as people navigate between threads and pages
        if (!isChatPage) return

        if (!e.metaKey) {
          e.preventDefault()
          const { pathname, query } = Router

          query.threadId = thread.id
          if (isMobile) {
            Router.push(`/${thread.organization_slug}/chat/${thread.id}`, undefined, { shallow: true })
          } else {
            Router.replace({ pathname, query }, `/${thread.organization_slug}/chat/${thread.id}`, { shallow: true })
          }
        }
      }}
    >
      <ThreadAvatar thread={thread} />
      <div className='flex flex-1 flex-col'>
        <div className='flex flex-1 items-center gap-1.5'>
          <UIText primary size='text-[15px]' weight='font-medium' className='break-anywhere line-clamp-1'>
            {thread.title}
          </UIText>
        </div>
        <UIText
          inherit
          className={cn('break-anywhere -mb-0.5 line-clamp-1 min-w-0 flex-1 break-all', {
            'text-primary': thread.unread_count > 0,
            'text-secondary': thread.unread_count === 0
          })}
        >
          {thread.latest_message_truncated}
        </UIText>
      </div>
      {thread.last_message_at && (
        <>
          {thread.unread_count > 0 && <div className='h-2.5 w-2.5 flex-none rounded-full bg-blue-500' />}
          <UIText quaternary>
            <RelativeTime time={thread.last_message_at} />
          </UIText>
        </>
      )}
    </Link>
  )
}
