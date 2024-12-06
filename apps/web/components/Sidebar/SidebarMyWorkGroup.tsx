import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'

import { ChatBubbleIcon, HomeIcon, NoteIcon, VideoCameraIcon } from '@campsite/ui/Icons'

import { CallsHoverCard } from '@/components/Calls/CallsHoverCard'
import { ChatHoverList } from '@/components/Chat/ChatHoverCard'
import { sidebarCollapsedAtom } from '@/components/Layout/AppLayout'
import {
  useRefetchCallsIndex,
  useRefetchNotesIndex,
  useRefetchPostsIndex
} from '@/components/NavigationBar/useNavigationTabAction'
import { NotesHoverList } from '@/components/NotesIndex/NotesHoverCard'
import { SidebarLink } from '@/components/Sidebar/SidebarLink'
import { SidebarUnreadBadge } from '@/components/Sidebar/SidebarUnreadBadge'
import { useScope } from '@/contexts/scope'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useGetUnreadNotificationsCount } from '@/hooks/useGetUnreadNotificationsCount'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { useMarkIndexPageRead } from '@/hooks/useMarkIndexPageUnread'

export function SidebarMyWorkItems() {
  const router = useRouter()
  const { scope } = useScope()
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)
  const refetchNotes = useRefetchNotesIndex()
  const refetchCalls = useRefetchCallsIndex()
  const isCommunity = useIsCommunity()
  const isViewingNotes = router.pathname === '/[org]/notes'
  const isViewingCalls = router.pathname === '/[org]/calls'
  const hasSidebarDms = useCurrentUserOrOrganizationHasFeature('sidebar_dms')
  const getUnreadNotificationsCount = useGetUnreadNotificationsCount()
  const unreadDMCount = getUnreadNotificationsCount.data?.messages[`${scope}`] || 0
  const hasUnreadDMs = unreadDMCount > 0

  function onNotesClick() {
    refetchNotes()
  }

  function onCallsClick() {
    refetchCalls()
  }

  return (
    <>
      {hasSidebarDms && (
        <ChatHoverList alignOffset={-44} sideOffset={4} disabled={sidebarCollapsed}>
          <SidebarLink
            id='dms'
            label='Messages'
            unread={hasUnreadDMs}
            trailingAccessory={
              hasUnreadDMs && <SidebarUnreadBadge important={false}>{unreadDMCount}</SidebarUnreadBadge>
            }
            active={router.pathname.startsWith('/[org]/chat') && router.query.focus !== 'true'}
            leadingAccessory={<ChatBubbleIcon />}
            href={`/${scope}/chat`}
          />
        </ChatHoverList>
      )}

      <NotesHoverList alignOffset={-44} sideOffset={4} disabled={sidebarCollapsed || isViewingNotes}>
        <SidebarLink
          id='notes'
          label='Docs'
          active={router.pathname === '/[org]/notes'}
          leadingAccessory={<NoteIcon />}
          href={`/${scope}/notes`}
          onClick={onNotesClick}
        />
      </NotesHoverList>

      {!isCommunity && (
        <CallsHoverCard sideOffset={4} alignOffset={-44} disabled={sidebarCollapsed || isViewingCalls}>
          <SidebarLink
            id='calls'
            label='Calls'
            active={router.pathname === '/[org]/calls'}
            leadingAccessory={<VideoCameraIcon />}
            href={`/${scope}/calls`}
            onClick={onCallsClick}
          />
        </CallsHoverCard>
      )}
    </>
  )
}
export function SidebarHome() {
  const router = useRouter()
  const { scope } = useScope()
  const refetchPosts = useRefetchPostsIndex()
  const isPosts = router.pathname === '/[org]/posts' || router.pathname === '/[org]/posts/subscribed'

  const { mutate: markIndexPageRead } = useMarkIndexPageRead()

  function onPostsClick() {
    refetchPosts()
    markIndexPageRead()
  }

  return (
    <SidebarLink
      active={isPosts}
      id='posts'
      label='Home'
      leadingAccessory={<HomeIcon />}
      href={`/${scope}/posts`}
      onClick={onPostsClick}
    />
  )
}
