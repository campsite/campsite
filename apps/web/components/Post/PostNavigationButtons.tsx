import { useEffect, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/router'

import { GetMembersMeForMePostsParams, GetMembersMeViewerPostsParams, GetPostsParams, PostPage } from '@campsite/types'
import { Button } from '@campsite/ui/Button'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'
import { ChevronDownIcon, ChevronUpIcon } from '@campsite/ui/Icons'

import { useScope } from '@/contexts/scope'
import { useGetCurrentMemberPosts } from '@/hooks/useGetCurrentMemberPosts'
import { useGetForMePosts } from '@/hooks/useGetForMePosts'
import { useGetMemberPosts } from '@/hooks/useGetMemberPosts'
import { useGetPosts } from '@/hooks/useGetPosts'
import { useGetProjectPosts } from '@/hooks/useGetProjectPosts'
import { useGetTagPosts } from '@/hooks/useGetTagPosts'
import { atomWithWebStorage } from '@/utils/atomWithWebStorage'
import { CommandListSubject, getCommandListSubject } from '@/utils/commandListSubject'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

type LastUsedPostFeed =
  | undefined
  | {
      type: 'member'
      username: string
    }
  | {
      type: 'project'
      projectId: string
    }
  | {
      type: 'tag'
      tagName: string
    }
  | {
      type: 'created'
      order: GetMembersMeViewerPostsParams['order']
    }
  | {
      type: 'for-me'
      order: GetMembersMeForMePostsParams['order']
    }
  | {
      type: 'all'
      order: GetPostsParams['order']
    }

const lastUsedPostFeedAtom = atomWithWebStorage<LastUsedPostFeed>(
  'lastUsedPostFeed',
  undefined,
  /**
   * Persist atom is `sessionStorage` so state doesn't leak between tabs.
   * This avoids bugs and race conditions if you have multiple feeds
   * open across different tabs.
   */
  typeof window !== 'undefined' ? window.sessionStorage : undefined
)

/**
 * Temporary cache of for storing the last subject that was opened. Used to persist
 * subject selection when navigating back to the feed.
 */
export const lastUsedSubjectAtom = atom<CommandListSubject | undefined>(undefined)

export const setLastUsedPostFeedAtom = atom(null, (_, set, value: LastUsedPostFeed) => set(lastUsedPostFeedAtom, value))

function PostNavigationButtonsImpl({
  postId,
  getPosts
}: {
  postId: string
  getPosts: ReturnType<typeof useInfiniteQuery<PostPage>>
}) {
  const router = useRouter()
  const { scope } = useScope()
  const { data, hasNextPage, isError, isFetching, isFetchingNextPage, fetchNextPage } = getPosts
  const canFetchNextPage = !isError && !isFetching && !isFetchingNextPage && hasNextPage
  const posts = useMemo(() => flattenInfiniteData(data), [data])
  const setLastUsedSubject = useSetAtom(lastUsedSubjectAtom)

  const currentPost = posts?.find((post) => post.id === postId)
  const currentPostIndex = posts?.findIndex((post) => post.id === postId) ?? -1
  const hasPreviousPost = currentPostIndex !== 0
  const hasNextPost = (() => {
    if (!posts) return false
    if (hasNextPage) return true

    return currentPostIndex !== posts.length - 1
  })()

  /**
   * Router navigations should be done using `router.replace`. This way we can
   * natively make the back button navigate back to the last used feed.
   */

  const handleNavigateUp = () => () => {
    if (!hasPreviousPost || !posts || currentPostIndex === -1) return

    const previousPost = posts[currentPostIndex - 1]

    if (!previousPost) return

    router.replace(`/${scope}/posts/${previousPost.id}`)
  }

  const handleNavigateDown = () => () => {
    if (!hasNextPost || !posts || currentPostIndex === -1) return

    // if post is post is second to last or last, fetch next page
    if (currentPostIndex >= posts.length - 2 && canFetchNextPage) {
      fetchNextPage()
    }

    const nextPost = posts[currentPostIndex + 1]

    if (!nextPost) return

    router.replace(`/${scope}/posts/${nextPost.id}`)
  }

  /**
   * It's more reliable to persist the `lastUsedSubject` as part of a mount
   * effect rather than setting it in the navigation handlers since router
   * events are not guaranteed and can be interrupted.
   */
  useEffect(() => {
    setLastUsedSubject(currentPost ? getCommandListSubject(currentPost) : undefined)
  }, [currentPost, setLastUsedSubject])

  if (currentPostIndex === -1) return null

  return (
    <div className='flex items-center gap-1'>
      <LayeredHotkeys keys='k' callback={handleNavigateUp()} options={{ enabled: hasPreviousPost }} />
      <LayeredHotkeys keys='j' callback={handleNavigateDown()} options={{ enabled: hasNextPost }} />

      <Button
        variant='plain'
        iconOnly={<ChevronUpIcon />}
        accessibilityLabel='Go to previous post'
        tooltip='Navigate up'
        tooltipShortcut='k'
        onClick={handleNavigateUp()}
        disabled={!hasPreviousPost}
      />
      <Button
        variant='plain'
        iconOnly={<ChevronDownIcon />}
        accessibilityLabel='Go to next post'
        tooltip='Navigate down'
        tooltipShortcut='j'
        onClick={handleNavigateDown()}
        disabled={!hasNextPost}
      />

      <div className='mx-1 h-6 w-[1px] border-r' />
    </div>
  )
}

function MemberFeedNavigationButtons({ postId, username }: { postId: string; username: string }) {
  const getPosts = useGetMemberPosts({ username })

  return <PostNavigationButtonsImpl postId={postId} getPosts={getPosts} />
}

function ProjectFeedNavigationButtons({ postId, projectId }: { postId: string; projectId: string }) {
  const getPosts = useGetProjectPosts({ projectId })

  return <PostNavigationButtonsImpl postId={postId} getPosts={getPosts} />
}

function TagFeedNavigationButtons({ postId, tagName }: { postId: string; tagName: string }) {
  const getPosts = useGetTagPosts({ tagName })

  return <PostNavigationButtonsImpl postId={postId} getPosts={getPosts} />
}

function CreatedFeedNavigationButtons({
  postId,
  order
}: {
  postId: string
  order: GetMembersMeViewerPostsParams['order']
}) {
  const getPosts = useGetCurrentMemberPosts({ order })

  return <PostNavigationButtonsImpl postId={postId} getPosts={getPosts} />
}

function ForMeFeedNavigationButtons({
  postId,
  order
}: {
  postId: string
  order: GetMembersMeForMePostsParams['order']
}) {
  const getPosts = useGetForMePosts({ order })

  return <PostNavigationButtonsImpl postId={postId} getPosts={getPosts} />
}

function AllFeedNavigationButtons({ postId, order }: { postId: string; order: GetPostsParams['order'] }) {
  const getPosts = useGetPosts({ order })

  return <PostNavigationButtonsImpl postId={postId} getPosts={getPosts} />
}

export function PostNavigationButtons({ postId }: { postId: string }) {
  const router = useRouter()
  const lastUsedPostFeed = useAtomValue(lastUsedPostFeedAtom)
  const isInbox = router.pathname.startsWith('/[org]/inbox/[inboxView]')

  if (isInbox) return null
  if (!lastUsedPostFeed) return null

  if (lastUsedPostFeed.type === 'member') {
    return <MemberFeedNavigationButtons postId={postId} username={lastUsedPostFeed.username} />
  }

  if (lastUsedPostFeed.type === 'project') {
    return <ProjectFeedNavigationButtons postId={postId} projectId={lastUsedPostFeed.projectId} />
  }

  if (lastUsedPostFeed.type === 'tag') {
    return <TagFeedNavigationButtons postId={postId} tagName={lastUsedPostFeed.tagName} />
  }

  if (lastUsedPostFeed.type === 'created') {
    return <CreatedFeedNavigationButtons postId={postId} order={lastUsedPostFeed.order} />
  }

  if (lastUsedPostFeed.type === 'for-me') {
    return <ForMeFeedNavigationButtons postId={postId} order={lastUsedPostFeed.order} />
  }

  if (lastUsedPostFeed.type === 'all') {
    return <AllFeedNavigationButtons postId={postId} order={lastUsedPostFeed.order} />
  }

  return null
}
