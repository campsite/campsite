import { useEffect, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useAtom } from 'jotai'

import { Post, PostPage } from '@campsite/types'
import { Command, useCommand } from '@campsite/ui/Command'
import { ConditionalWrap } from '@campsite/ui/utils'

import { CompactPost } from '@/components/CompactPost/CompactPost'
import { EmptySearchResults } from '@/components/Feed/EmptySearchResults'
import { IndexPageLoading } from '@/components/IndexPages/components'
import { InfiniteLoader } from '@/components/InfiniteLoader'
import { lastUsedSubjectAtom } from '@/components/Post/PostNavigationButtons'
import { encodeCommandListSubject } from '@/utils/commandListSubject'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

interface Props {
  getPosts: ReturnType<typeof useInfiniteQuery<PostPage>>
  hideProject?: boolean
}

export function SearchFeed({ getPosts, hideProject }: Props) {
  const posts = useMemo(() => flattenInfiniteData(getPosts.data), [getPosts.data])
  const hasPosts = !!posts?.length
  const isInitialLoading = getPosts.isLoading

  return (
    <>
      {isInitialLoading && <IndexPageLoading />}
      {!isInitialLoading && !hasPosts && <EmptySearchResults />}
      {!isInitialLoading && hasPosts && <Posts posts={posts} hideProject={hideProject} />}

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

function Posts({ posts, hideProject }: { posts: Post[]; hideProject?: boolean }) {
  const [lastUsedSubject, setLastUsedSubject] = useAtom(lastUsedSubjectAtom)

  // reset lastUsedPostId when the component unmounts
  useEffect(() => {
    return () => setLastUsedSubject(undefined)
  }, [setLastUsedSubject])

  const needsCommandWrap = !useCommand()

  return (
    <ConditionalWrap
      condition={needsCommandWrap}
      wrap={(children) => (
        <Command defaultValue={lastUsedSubject ? encodeCommandListSubject(lastUsedSubject) : undefined}>
          <Command.List className='-mx-2 flex flex-1 flex-col gap-px'>{children}</Command.List>
        </Command>
      )}
    >
      {posts.map((post) => (
        <CompactPost post={post} key={post.id} display='search' hideProject={hideProject} />
      ))}
    </ConditionalWrap>
  )
}
