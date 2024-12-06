import { useInfiniteQuery } from '@tanstack/react-query'

import { PostPage } from '@campsite/types'

import { ComfortableFeed } from '@/components/Feed/ComfortableFeed'
import { ComfyCompactFeed } from '@/components/Feed/ComfyCompactFeed'
import { CompactFeed, GroupType } from '@/components/Feed/CompactFeed'
import { SearchFeed } from '@/components/Feed/SearchFeed'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { usePostsDisplayPreference } from '@/hooks/usePostsDisplayPreference'

interface Props {
  getPosts: ReturnType<typeof useInfiniteQuery<PostPage>>
  isWriteableForViewer?: boolean
  forceLayout?: 'grid' | 'feed' | 'note'
  group?: GroupType
  searching?: boolean
  hideProject?: boolean
  hideReactions?: boolean
  hideAttachments?: boolean
  hideComments?: boolean
}

export function Feed({
  getPosts,
  group,
  isWriteableForViewer,
  searching,
  hideProject,
  hideReactions,
  hideAttachments,
  hideComments,
  forceLayout
}: Props) {
  const displayPreference = usePostsDisplayPreference()
  const hasComfyCompactLayout = useCurrentUserOrOrganizationHasFeature('comfy_compact_layout')

  if (hasComfyCompactLayout) {
    return (
      <ComfyCompactFeed
        getPosts={getPosts}
        group={group || 'last_activity_at'}
        hideProject={hideProject}
        hideReactions={hideReactions}
        hideAttachments={hideAttachments}
        hideComments={hideComments}
      />
    )
  }

  if (searching) {
    return <SearchFeed getPosts={getPosts} hideProject={hideProject} />
  }

  if (displayPreference === 'compact' && forceLayout !== 'feed') {
    return <CompactFeed getPosts={getPosts} group={group || 'last_activity_at'} hideProject={hideProject} />
  }

  return <ComfortableFeed getPosts={getPosts} isWriteableForViewer={isWriteableForViewer} hideProject={hideProject} />
}
