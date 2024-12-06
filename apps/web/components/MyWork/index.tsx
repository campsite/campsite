import { useAtom, useAtomValue } from 'jotai'

import { Button } from '@campsite/ui/Button'
import { UIText } from '@campsite/ui/Text'
import { cn } from '@campsite/ui/utils'

import { EnablePush } from '@/components/EnablePush'
import { Feed } from '@/components/Feed'
import { FloatingNewPostButton } from '@/components/FloatingButtons/NewPost'
import { HomeSidebar } from '@/components/Home/HomeSidebar'
import { NewPostButton } from '@/components/Home/NewPostButton'
import { IndexPageContainer, IndexPageContent } from '@/components/IndexPages/components'
import { RefetchingPageIndicator } from '@/components/NavigationBar/RefetchingPageIndicator'
import { refetchingPostsAtom } from '@/components/NavigationBar/useNavigationTabAction'
import { UserFeedOnboarding } from '@/components/Onboarding/UserFeedOnboarding'
import { PostsIndexDisplayDropdown } from '@/components/PostsIndex/PostsIndexDisplayDropdown'
import { SplitViewContainer, SplitViewDetail } from '@/components/SplitView'
import { useScope } from '@/contexts/scope'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { filterAtom as postsFilterAtom, useGetPostsIndex } from '@/hooks/useGetPostsIndex'
import { usePostsDisplayPreference } from '@/hooks/usePostsDisplayPreference'

export function MyWork() {
  return (
    <SplitViewContainer>
      <IndexPageContainer>
        <MyWorkPosts />
      </IndexPageContainer>

      <SplitViewDetail fallback={<HomeSidebar />} fallbackWidth='var(--sidebar-width)' />
    </SplitViewContainer>
  )
}

function MyWorkPosts() {
  const { getPosts, sort } = useGetPostsIndex()
  const isRefetching = useAtomValue(refetchingPostsAtom)

  const displayPreference = usePostsDisplayPreference()
  const hasComfyCompactLayout = useCurrentUserOrOrganizationHasFeature('comfy_compact_layout')
  const { data: currentUser } = useGetCurrentUser()

  return (
    <>
      <div className='hidden lg:flex lg:flex-col'>
        <UserFeedOnboarding />
        <EnablePush containerClassName='p-4' />
      </div>

      <IndexPageContent id='/[org]/posts' className='@container lg:py-16'>
        <div
          className={cn('flex flex-col', {
            'mx-auto w-full max-w-[--feed-width]': !hasComfyCompactLayout && displayPreference === 'comfortable'
          })}
        >
          <div className='mb-4 flex flex-col gap-4 md:mb-6 lg:mb-8'>
            <UIText size='text-4xl' weight='font-bold' className='hidden -tracking-[1px] lg:flex'>
              Home
            </UIText>
            <MyWorkPostsFilters />
          </div>

          <NewPostButton />
          <RefetchingPageIndicator isRefetching={isRefetching} />
        </div>

        <Feed
          isWriteableForViewer={false}
          getPosts={getPosts}
          group={sort}
          searching={false}
          hideReactions={currentUser?.preferences.home_display_reactions === 'false'}
          hideAttachments={currentUser?.preferences.home_display_attachments === 'false'}
          hideComments={currentUser?.preferences.home_display_comments === 'false'}
        />
      </IndexPageContent>

      <FloatingNewPostButton />
    </>
  )
}

function MyWorkPostsFilters() {
  const { scope } = useScope()
  const [filter, setFilter] = useAtom(postsFilterAtom({ scope }))

  return (
    <div className='flex items-center gap-0.5'>
      <Button onClick={() => setFilter('for-me')} variant={filter === 'for-me' ? 'flat' : 'plain'}>
        For me
      </Button>
      <Button onClick={() => setFilter('created')} variant={filter === 'created' ? 'flat' : 'plain'}>
        Created
      </Button>
      <Button className='mr-auto' onClick={() => setFilter('all')} variant={filter === 'all' ? 'flat' : 'plain'}>
        All
      </Button>
      <PostsIndexDisplayDropdown />
    </div>
  )
}
