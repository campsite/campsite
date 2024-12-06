import { useState } from 'react'
import { useRouter } from 'next/router'

import { PlusIcon } from '@campsite/ui/Icons'
import { UIText } from '@campsite/ui/Text'

import { CreateChatThreadDialog } from '@/components/Chat/CreateChatThreadDialog'
import { SidebarChatThread } from '@/components/Sidebar/SidebarChatThread'
import { SidebarCollapsibleButton } from '@/components/Sidebar/SidebarCollapsibleButton'
import { SidebarGroup } from '@/components/Sidebar/SidebarGroup'
import { SidebarLink } from '@/components/Sidebar/SidebarLink'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useGetThreads } from '@/hooks/useGetThreads'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { useScopedStorage } from '@/hooks/useScopedStorage'

export function SidebarChatSectionGroup() {
  const router = useRouter()
  const { data: threadsInbox, isLoading } = useGetThreads()
  const hasThreads = threadsInbox?.threads && threadsInbox.threads.length > 0
  const [collapsed, setCollapsed] = useScopedStorage('sidebar-chat-collapsed', false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<undefined | string>()
  const hasSidebarDMs = useCurrentUserOrOrganizationHasFeature('sidebar_dms')

  const selectedThreadId = router.query.threadId as string
  const nonFavoritedThreads = threadsInbox?.threads.filter((thread) => !thread.viewer_has_favorited)
  const unreadAndSelectedItems = nonFavoritedThreads?.filter((thread) => {
    const isHovering = thread.id === hoveredId

    return thread.manually_marked_unread || thread.unread_count > 0 || thread.id === selectedThreadId || isHovering
  })

  const renderableItems = collapsed ? unreadAndSelectedItems : nonFavoritedThreads

  const isCommunity = useIsCommunity()

  if (isCommunity) return null
  if (isLoading) return null
  if (hasSidebarDMs) return null

  if (!hasThreads || (!collapsed && !nonFavoritedThreads?.length)) {
    return (
      <SidebarGroup>
        <SidebarCollapsibleButton collapsed={collapsed} setCollapsed={setCollapsed} label='Chat' />

        {!collapsed && (
          <>
            <CreateChatThreadDialog onOpenChange={setCreateDialogOpen} open={createDialogOpen} />
            <div className='text-quaternary p-2 pt-0.5'>
              <div className='flex flex-col gap-1'>
                <UIText size='text-xs' inherit>
                  Send direct messages or start a group conversation.
                </UIText>
                <button onClick={() => setCreateDialogOpen(true)} className='text-left text-blue-500 hover:underline'>
                  <UIText size='text-xs' inherit>
                    New chat
                  </UIText>
                </button>
              </div>
            </div>
          </>
        )}
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className='group/chat'>
      <div className='flex items-center gap-px'>
        <SidebarCollapsibleButton collapsed={collapsed} setCollapsed={setCollapsed} label='Chat' />

        <button
          onClick={() => setCreateDialogOpen(true)}
          className='hover:bg-quaternary text-tertiary hover:text-primary group flex h-6 w-6 items-center justify-center rounded-md p-0.5 opacity-0 focus:outline-0 focus:ring-0 group-hover/chat:opacity-100 group-has-[[data-state="open"]]/chat:opacity-100'
        >
          <PlusIcon size={16} strokeWidth='2' />
        </button>
      </div>

      <ul className='flex flex-col gap-px'>
        {renderableItems?.map((thread) => (
          <SidebarChatThread thread={thread} key={thread.id} onPeek={setHoveredId} location='chats' />
        ))}
        {!collapsed && (
          <SidebarLink
            id='new-chat'
            onClick={() => setCreateDialogOpen(true)}
            label='New chat'
            leadingAccessory={<PlusIcon />}
          />
        )}
      </ul>

      <CreateChatThreadDialog onOpenChange={setCreateDialogOpen} open={createDialogOpen} />
    </SidebarGroup>
  )
}
