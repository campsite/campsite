import { useMemo, useState } from 'react'
import { InfiniteData } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'

import { Post, PostPage } from '@campsite/types'
import { Button, cn, Command, LazyLoadingSpinner, PostIcon, UIText } from '@campsite/ui'
import { HoverCard } from '@campsite/ui/src/HoverCard'

import { CompactPost } from '@/components/CompactPost/CompactPost'
import { EmptyState } from '@/components/EmptyState'
import { useScope } from '@/contexts/scope'
import { PostsIndexFilterType, useGetPostsIndex } from '@/hooks/useGetPostsIndex'
import { useScopedStorage } from '@/hooks/useScopedStorage'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { getGroupDateHeading } from '@/utils/getGroupDateHeading'
import { groupByDate } from '@/utils/groupByDate'

import { sidebarCollapsedAtom } from '../Layout/AppLayout'

interface ProjectHoverCardProps extends React.PropsWithChildren {}

export function PostsHoverCard({ children }: ProjectHoverCardProps) {
  const router = useRouter()
  const { scope } = useScope()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useScopedStorage<PostsIndexFilterType>('posts-index-filter', 'for-me')
  const { getPosts } = useGetPostsIndex({ localFilter: filter, enabled: open })
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)
  const isViewingPosts = router.pathname === `/[org]/posts`
  const disabled = sidebarCollapsed || isViewingPosts
  const href = `/${scope}/posts`

  const handleOpenChange = (newVal: boolean) => {
    setOpen(newVal)
  }

  return (
    <HoverCard open={open} onOpenChange={handleOpenChange} disabled={disabled} targetHref={href}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Content sideOffset={4} alignOffset={-44}>
        <HoverCard.Content.TitleBar>
          <Button onClick={() => setFilter('for-me')} variant={filter === 'for-me' ? 'flat' : 'plain'}>
            For me
          </Button>
          <Button onClick={() => setFilter('created')} variant={filter === 'created' ? 'flat' : 'plain'}>
            Created
          </Button>
          <Button className='mr-auto' onClick={() => setFilter('all')} variant={filter === 'all' ? 'flat' : 'plain'}>
            All
          </Button>
        </HoverCard.Content.TitleBar>

        <InnerPosts {...getPosts} />
      </HoverCard.Content>
    </HoverCard>
  )
}

function InnerPosts({ data, isLoading }: { data: InfiniteData<PostPage> | undefined; isLoading: boolean }) {
  const groupedPosts = useMemo(() => groupByDate(flattenInfiniteData(data) || [], (post) => post.created_at), [data])
  const hasPosts = !!Object.keys(groupedPosts).length

  return (
    <>
      {hasPosts && <PostsList groupedPosts={groupedPosts} />}
      {!hasPosts && !isLoading && (
        <div className='flex flex-1 items-center justify-center px-6 py-12'>
          <EmptyState title='No posts' icon={<PostIcon className='text-quaternary' size={32} />} />
        </div>
      )}
      {!hasPosts && isLoading && (
        <div className='flex flex-1 items-center justify-center px-6 py-12'>
          <LazyLoadingSpinner />
        </div>
      )}
    </>
  )
}

interface PostsListProps {
  groupedPosts: Record<string, Post[]>
}

function PostsList({ groupedPosts }: PostsListProps) {
  return (
    <Command
      className='scrollbar-hide flex max-h-[420px] flex-col gap-px overflow-y-auto overscroll-contain outline-none'
      disableAutoSelect
      focusSelection
    >
      <Command.List>
        {Object.entries(groupedPosts).map(([date, posts], i) => {
          const dateHeading = getGroupDateHeading(date)

          return (
            <div key={date} className='flex flex-col'>
              <div
                className={cn('bg-primary sticky top-0 z-10 border-b px-3 py-1.5', {
                  'mt-4': i !== 0
                })}
              >
                <UIText weight='font-medium' tertiary>
                  {dateHeading}
                </UIText>
              </div>

              <div className='p-2'>
                {posts.map((post) => (
                  <CompactPost key={post.id} post={post} />
                ))}
              </div>
            </div>
          )
        })}
      </Command.List>
    </Command>
  )
}
