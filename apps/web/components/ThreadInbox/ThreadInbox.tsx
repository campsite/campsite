import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'

import { MessageThread } from '@campsite/types'
import { Button, PlusIcon } from '@campsite/ui'

import { CreateChatThreadDialog } from '@/components/Chat/CreateChatThreadDialog'
import { RefetchingPageIndicator } from '@/components/NavigationBar/RefetchingPageIndicator'
import { refetchingChatAtom } from '@/components/NavigationBar/useNavigationTabAction'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useGetThreads } from '@/hooks/useGetThreads'

import { ExistingThreadListItem } from '../Chat/ExistingThreadListItem'
import { ScrollableContainer } from '../ScrollableContainer'
import { BreadcrumbLabel, BreadcrumbTitlebar } from '../Titlebar/BreadcrumbTitlebar'

export function ThreadInbox() {
  const isRefetching = useAtomValue(refetchingChatAtom)
  const { data: inbox } = useGetThreads()
  const { threads } = inbox || {}
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const hasSidebarDms = useCurrentUserOrOrganizationHasFeature('sidebar_dms')

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <BreadcrumbTitlebar>
        <div className='flex flex-1 items-center gap-3'>
          <BreadcrumbLabel>{hasSidebarDms ? 'Messages' : 'Chat'}</BreadcrumbLabel>
        </div>

        <Button
          iconOnly={<PlusIcon />}
          accessibilityLabel='New chat'
          variant='plain'
          onClick={() => setCreateDialogOpen(true)}
        />
        <CreateChatThreadDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      </BreadcrumbTitlebar>

      <ScrollableContainer id='/[org]/chat' disableScrollRestoration disableStableGutter>
        <RefetchingPageIndicator isRefetching={isRefetching} />

        <ThreadInboxList threads={threads} />
      </ScrollableContainer>
    </div>
  )
}

function ThreadInboxList({ threads }: { threads: MessageThread[] | undefined }) {
  const router = useRouter()
  const { threadId } = router.query

  if (!threads?.length) return null

  return (
    <div className='flex flex-col gap-0.5 p-2'>
      {threads.map((thread) => (
        <ExistingThreadListItem key={thread.id} thread={thread} isSelected={thread.id === threadId} />
      ))}
    </div>
  )
}
