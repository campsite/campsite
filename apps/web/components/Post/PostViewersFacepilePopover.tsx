import { useMemo } from 'react'

import { Post } from '@campsite/types/generated'
import { Button } from '@campsite/ui'

import { FacePile } from '@/components/FacePile'
import { PostViewersPopover } from '@/components/Post/PostViewersPopover'
import { useGetPostViews } from '@/hooks/useGetPostViews'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

export function PostViewersFacepilePopover({ post }: { post: Post }) {
  const { data: viewsData } = useGetPostViews({ postId: post.id })
  const facepileUsers = useMemo(() => {
    const usersMap = new Map()
    const views = flattenInfiniteData(viewsData) || []
    const followUpUsers = post.follow_ups.map((f) => f.member.user) || []

    followUpUsers.forEach((user) => {
      usersMap.set(user.id, user)
    })

    views
      .map((view) => view.member.user)
      .forEach((user) => {
        if (!usersMap.has(user.id)) {
          usersMap.set(user.id, user)
        }
      })

    return Array.from(usersMap.values())
  }, [post.follow_ups, viewsData])

  const totalFollowUps = post.follow_ups.length
  const totalViewCount = post.views_count + post.non_member_views_count

  if (!post.viewer_is_organization_member) return null
  if (totalViewCount === 0 && totalFollowUps === 0) return null
  if (!facepileUsers.length) return null

  return (
    <PostViewersPopover post={post}>
      <Button round variant='plain' className='px-1'>
        <FacePile users={facepileUsers} size='sm' limit={3} showTooltip={false} totalUserCount={totalViewCount} />
      </Button>
    </PostViewersPopover>
  )
}
