import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { Post, PostPage } from '@campsite/types'
import { Command, useCommand } from '@campsite/ui/Command'
import { UIText } from '@campsite/ui/Text'
import { ConditionalWrap } from '@campsite/ui/utils'

import { ComfyCompactPost } from '@/components/CompactPost/ComfyCompactPost'
import { IndexPageLoading } from '@/components/IndexPages/components'
import { InfiniteLoader } from '@/components/InfiniteLoader'
import { PostsIndexEmptyState } from '@/components/PostsIndex/PostsIndexEmptyState'
import { SubjectCommand } from '@/components/Subject'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { getGroupDateHeading } from '@/utils/getGroupDateHeading'
import { groupByDate } from '@/utils/groupByDate'

export type GroupType = 'last_activity_at' | 'published_at'

interface Props {
  getPosts: ReturnType<typeof useInfiniteQuery<PostPage>>
  group: GroupType
  hideProject?: boolean
  hideReactions?: boolean
  hideAttachments?: boolean
  hideComments?: boolean
}

export function ComfyCompactFeed({
  getPosts,
  group,
  hideProject,
  hideReactions,
  hideAttachments,
  hideComments
}: Props) {
  const posts = useMemo(() => flattenInfiniteData(getPosts.data) || [], [getPosts.data])
  const hasPosts = !!posts?.length
  const isInitialLoading = getPosts.isLoading

  return (
    <>
      {isInitialLoading && <IndexPageLoading />}
      {!isInitialLoading && !hasPosts && <PostsIndexEmptyState />}
      {!isInitialLoading && hasPosts && (
        <GroupedPosts
          posts={posts}
          group={group}
          hideProject={hideProject}
          hideReactions={hideReactions}
          hideAttachments={hideAttachments}
          hideComments={hideComments}
        />
      )}

      <InfiniteLoader
        hasNextPage={!!getPosts.hasNextPage}
        isError={!!getPosts.isError}
        isFetching={!!getPosts.isFetching}
        isFetchingNextPage={!!getPosts.isFetchingNextPage}
        fetchNextPage={getPosts.fetchNextPage}
      />
    </>
  )
}

interface GroupedPostsProps {
  posts: Post[]
  group: GroupType
  hideProject?: boolean
  hideReactions?: boolean
  hideAttachments?: boolean
  hideComments?: boolean
}

function GroupedPosts({ posts, group, hideProject, hideReactions, hideAttachments, hideComments }: GroupedPostsProps) {
  const groups = useMemo(() => groupByDate(posts, (post) => post[group] || post.created_at), [posts, group])

  const needsCommandWrap = !useCommand()

  return (
    <ConditionalWrap
      condition={needsCommandWrap}
      wrap={(children) => (
        <SubjectCommand>
          <Command.List className='flex flex-1 flex-col gap-4 md:gap-6 lg:gap-8'>{children}</Command.List>
        </SubjectCommand>
      )}
    >
      {Object.entries(groups).map(([date, posts]) => {
        const dateHeading = getGroupDateHeading(date)

        return (
          <div key={date} className='flex flex-col'>
            <div className='flex items-center gap-4 py-2'>
              <UIText weight='font-medium' tertiary>
                {dateHeading}
              </UIText>
              <div className='flex-1 border-b' />
            </div>

            <div className='@container -mx-2 flex flex-col gap-3 py-1'>
              {posts.map((post) => (
                <ComfyCompactPost
                  post={post}
                  key={post.id}
                  hideProject={hideProject}
                  hideReactions={hideReactions}
                  hideAttachments={hideAttachments}
                  hideComments={hideComments}
                />
              ))}
            </div>
          </div>
        )
      })}
    </ConditionalWrap>
  )
}
