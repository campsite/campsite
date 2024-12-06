import { FormEvent, useMemo } from 'react'
import { useAtomValue } from 'jotai'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { Link, PostDraftIcon, TextField, UIText, useBreakpoint } from '@campsite/ui'

import { EnablePush } from '@/components/EnablePush'
import { FloatingNewPostButton } from '@/components/FloatingButtons/NewPost'
import { defaultInboxView } from '@/components/InboxItems/InboxSplitView'
import { AppLayout } from '@/components/Layout/AppLayout'
import { HomeFavorites } from '@/components/MobileHome/HomeFavorites'
import { HomeSpaces } from '@/components/MobileHome/HomeSpaces'
import { UnreadHomeSpaces } from '@/components/MobileHome/UnreadHomeSpaces'
import { refetchingHomeAtom } from '@/components/NavigationBar'
import { RefetchingPageIndicator } from '@/components/NavigationBar/RefetchingPageIndicator'
import { UserFeedOnboarding } from '@/components/Onboarding/UserFeedOnboarding'
import AuthAppProviders from '@/components/Providers/AuthAppProviders'
import { ScrollableContainer } from '@/components/ScrollableContainer'
import { CallBreadcrumbIcon, NoteBreadcrumbIcon, PostBreadcrumbIcon } from '@/components/Titlebar/BreadcrumbPageIcons'
import { useScope } from '@/contexts/scope'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetPersonalDraftPosts } from '@/hooks/useGetPersonalDraftPosts'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { PageWithLayout } from '@/utils/types'

const MyWorkHomePage: PageWithLayout<any> = () => {
  const router = useRouter()
  const { scope } = useScope()
  const { data: currentOrganization } = useGetCurrentOrganization()
  const isCommunity = useIsCommunity()
  const isRefetching = useAtomValue(refetchingHomeAtom)
  const isLg = useBreakpoint('lg')

  const { data: draftPostsData } = useGetPersonalDraftPosts()
  const draftPosts = useMemo(() => flattenInfiniteData(draftPostsData) ?? [], [draftPostsData])
  const hasDraftPosts = draftPosts.length > 0

  if (isLg) {
    router.push(`/${scope}/inbox/${defaultInboxView}`)
    return null
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const search = e.currentTarget.querySelector('input')?.value

    router.push(`/${scope}/search?q=${search}`)
  }

  return (
    <>
      <Head>
        <title>{currentOrganization?.name}</title>
      </Head>

      <FloatingNewPostButton />

      <ScrollableContainer id='/[org]/home' className='pb-20'>
        <div className='flex flex-col lg:hidden'>
          <UserFeedOnboarding />
          <EnablePush containerClassName='p-4' />
        </div>
        <RefetchingPageIndicator isRefetching={isRefetching} />

        <form className='p-4 pb-0' onSubmit={onSubmit}>
          <TextField
            placeholder='Search'
            additionalClasses='rounded-full border-transparent focus:border-blue-500 bg-tertiary dark:bg-tertiary focus:bg-elevated text-base pr-3 pl-4 py-3 h-10'
          />
        </form>

        <div className='scrollbar-hide flex flex-none gap-2 overflow-x-auto p-4'>
          {hasDraftPosts && (
            <Link
              href={`/${scope}/drafts`}
              className='bg-elevated flex min-w-[100px] flex-1 flex-col gap-2 rounded-[10px] border p-3 pb-2.5'
            >
              <PostDraftIcon size={24} />

              <div className='flex flex-row flex-nowrap items-center gap-1'>
                <UIText size='text-[15px]' weight='font-medium'>
                  Drafts
                </UIText>

                <div className='text-system-secondary bg-quaternary flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[12px] font-bold'>
                  {draftPosts.length}
                </div>
              </div>
            </Link>
          )}

          <Link
            href={`/${scope}/posts`}
            className='bg-elevated flex min-w-[100px] flex-1 flex-col gap-2 rounded-[10px] border p-3 pb-2.5'
          >
            <PostBreadcrumbIcon />
            <UIText size='text-[15px]' weight='font-medium'>
              Posts
            </UIText>
          </Link>

          <Link
            href={`/${scope}/notes`}
            className='bg-elevated flex min-w-[100px] flex-1 flex-col gap-2 rounded-[10px] border p-3 pb-2.5'
          >
            <NoteBreadcrumbIcon />
            <UIText size='text-[15px]' weight='font-medium'>
              Docs
            </UIText>
          </Link>

          {!isCommunity && (
            <Link
              href={`/${scope}/calls`}
              className='bg-elevated flex min-w-[100px] flex-1 flex-col gap-2 rounded-[10px] border p-3 pb-2.5'
            >
              <CallBreadcrumbIcon />
              <UIText size='text-[15px]' weight='font-medium'>
                Calls
              </UIText>
            </Link>
          )}
        </div>

        <UnreadHomeSpaces />
        <HomeFavorites />
        <HomeSpaces />
      </ScrollableContainer>
    </>
  )
}

MyWorkHomePage.getProviders = (page, pageProps) => {
  return (
    <AuthAppProviders {...pageProps}>
      <AppLayout {...pageProps}>{page}</AppLayout>
    </AuthAppProviders>
  )
}

export default MyWorkHomePage
