import { useRouter } from 'next/router'

import { cn } from '@campsite/ui/src/utils'

import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useIsCommunity } from '@/hooks/useIsCommunity'

import { ThreadInbox } from '../ThreadInbox'

export function ThreadSplitView({ children }: { children?: React.ReactNode }) {
  const router = useRouter()
  const { focus } = router.query
  const isViewingThread = !!router.query.threadId
  const isComposing = router.pathname === '/[org]/chat/new'
  const isThread = isViewingThread || isComposing
  const isCommunity = useIsCommunity()
  const hasSidebarDms = useCurrentUserOrOrganizationHasFeature('sidebar_dms')

  if (isCommunity) return null

  return (
    <div className='flex flex-1 overflow-hidden'>
      {(!focus || focus === 'false') && (
        <div
          className={cn('w-full flex-col overflow-hidden border-r lg:min-w-[200px] lg:max-w-[400px] lg:basis-[40%]', {
            hidden: isThread && !hasSidebarDms,
            'flex lg:hidden': !isThread && !hasSidebarDms,
            'hidden lg:flex': isThread && hasSidebarDms,
            flex: !isThread && hasSidebarDms
          })}
        >
          <ThreadInbox />
        </div>
      )}
      <div
        className={cn('flex flex-1 flex-col', {
          'hidden lg:flex': !isThread,
          flex: isThread
        })}
      >
        {children}
      </div>
    </div>
  )
}
