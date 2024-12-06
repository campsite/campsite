import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { PostPage } from '@campsite/types'

import { ViewerRoleInlineComposerUpsell } from '@/components/Feed/ViewerRoleInlineComposerUpsell'
import { NewPostButton } from '@/components/Home/NewPostButton'
import { IndexPageLoading } from '@/components/IndexPages/components'
import { InlinePost } from '@/components/InlinePost'
import { PostsIndexEmptyState } from '@/components/PostsIndex/PostsIndexEmptyState'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

import { InfiniteLoader } from '../InfiniteLoader'

interface Props {
  getPosts: ReturnType<typeof useInfiniteQuery<PostPage>>
  isWriteableForViewer?: boolean
  hideProject?: boolean
}

export function ComfortableFeed({ getPosts, isWriteableForViewer = true, hideProject }: Props) {
  const { data: currentOrganization } = useGetCurrentOrganization()
  const posts = useMemo(() => flattenInfiniteData(getPosts.data), [getPosts.data])
  const hasPosts = !!posts?.length

  if (getPosts.isLoading) return <IndexPageLoading />

  if (!hasPosts) {
    return (
      <div className='isolate mx-auto flex w-full max-w-[--feed-width] flex-1 flex-col transition-opacity lg:px-0'>
        {isWriteableForViewer && !currentOrganization?.viewer_can_post && <ViewerRoleInlineComposerUpsell />}
        <PostsIndexEmptyState isWriteableForViewer={isWriteableForViewer} />
      </div>
    )
  }

  return (
    <div className='isolate mx-auto flex w-full max-w-[--feed-width] flex-1 flex-col transition-opacity lg:px-0'>
      {isWriteableForViewer && currentOrganization?.viewer_can_post && <NewPostButton className='mb-8' />}

      {isWriteableForViewer && !currentOrganization?.viewer_can_post && <ViewerRoleInlineComposerUpsell />}

      <div className='relative flex flex-col'>
        <div className='flex flex-col gap-6'>
          {posts.map((post) => (
            <InlinePost key={post.id} post={post} hideProject={hideProject} />
          ))}
        </div>
      </div>

      <InfiniteLoader
        hasNextPage={!!getPosts.hasNextPage}
        isError={!!getPosts.isError}
        isFetching={!!getPosts.isFetching}
        isFetchingNextPage={!!getPosts.isFetchingNextPage}
        fetchNextPage={getPosts.fetchNextPage}
      />
    </div>
  )
}
