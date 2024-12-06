import { useMemo } from 'react'
import { useRouter } from 'next/router'

import { PostDraftIcon } from '@campsite/ui/Icons'

import { SidebarLink } from '@/components/Sidebar/SidebarLink'
import { SidebarUnreadBadge } from '@/components/Sidebar/SidebarUnreadBadge'
import { useScope } from '@/contexts/scope'
import { useGetPersonalDraftPosts } from '@/hooks/useGetPersonalDraftPosts'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

export function SidebarDrafts() {
  const router = useRouter()
  const { scope } = useScope()
  const { data: draftPostsData } = useGetPersonalDraftPosts()
  const draftPosts = useMemo(() => flattenInfiniteData(draftPostsData) ?? [], [draftPostsData])
  const isActive = router.pathname === '/[org]/drafts'

  if (draftPosts.length === 0 && !isActive) return null

  return (
    <SidebarLink
      id='drafts'
      label='Drafts'
      active={isActive}
      leadingAccessory={<PostDraftIcon />}
      trailingAccessory={
        draftPosts.length > 0 ? (
          <SidebarUnreadBadge important={false}>{draftPosts.length}</SidebarUnreadBadge>
        ) : undefined
      }
      href={`/${scope}/drafts`}
    />
  )
}
