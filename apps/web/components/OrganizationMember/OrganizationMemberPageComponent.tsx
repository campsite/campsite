import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

import { OrganizationMember } from '@campsite/types'
import { Badge, Button, GearIcon, Link, UIText, useCopyToClipboard } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { MemberChatButton } from '@/components/Chat/MemberChatButton'
import { ComfortableFeed } from '@/components/Feed/ComfortableFeed'
import { ComfyCompactFeed } from '@/components/Feed/ComfyCompactFeed'
import { GuestBadge } from '@/components/GuestBadge'
import { IndexPageContent } from '@/components/IndexPages/components'
import { MemberAvatar } from '@/components/MemberAvatar'
import { getTimestamp } from '@/components/MemberStatus'
import { OrganizationMemberOverflowMenu } from '@/components/People/PeopleList'
import { setLastUsedPostFeedAtom } from '@/components/Post/PostNavigationButtons'
import { PeopleBreadcrumbIcon } from '@/components/Titlebar/BreadcrumbPageIcons'
import { BreadcrumbLabel, BreadcrumbTitlebar } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetMemberPosts } from '@/hooks/useGetMemberPosts'
import { useGetOrganizationMember } from '@/hooks/useGetOrganizationMember'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { useViewportWidth } from '@/hooks/useViewportWidth'

export function OrganizationMemberPageComponent() {
  const { scope } = useScope()
  const router = useRouter()
  const username = router.query.username as string
  const getMember = useGetOrganizationMember({ username })
  const { data: currentUser } = useGetCurrentUser()
  const getPosts = useGetMemberPosts({ username })
  const setLastUsedFeed = useSetAtom(setLastUsedPostFeedAtom)
  const isCommunity = useIsCommunity()
  const member = getMember.data as OrganizationMember
  const viewportWidth = useViewportWidth()
  const [copy] = useCopyToClipboard()
  const hasComfyCompactLayout = useCurrentUserOrOrganizationHasFeature('comfy_compact_layout')

  useEffect(() => {
    setLastUsedFeed({ type: 'member', username })
  }, [username, setLastUsedFeed])

  return (
    <>
      <BreadcrumbTitlebar>
        <div className='flex items-center gap-1.5'>
          <Link draggable={false} href={`/${scope}/people`} className='flex items-center gap-3'>
            <PeopleBreadcrumbIcon />
            <BreadcrumbLabel>People</BreadcrumbLabel>
          </Link>
          <UIText quaternary>/</UIText>
          <BreadcrumbLabel>{member?.user.display_name}</BreadcrumbLabel>
        </div>

        <div className='ml-auto flex items-center gap-1.5'>
          {member?.user.id === currentUser?.id && (
            <Button variant='plain' leftSlot={<GearIcon />} href='/me/settings'>
              Account settings
            </Button>
          )}
          <OrganizationMemberOverflowMenu member={member} />
        </div>
      </BreadcrumbTitlebar>

      <IndexPageContent>
        <>
          {member.user.cover_photo_url && (
            <div
              className='block aspect-[3/1] max-h-[228px] w-full flex-none bg-cover bg-center'
              style={{ backgroundImage: `url(${member.user.cover_photo_url})` }}
            />
          )}
          <div className={cn({ 'mx-auto w-full max-w-[--feed-width]': !hasComfyCompactLayout })}>
            <div
              className={cn('max-sm: flex w-full flex-col justify-between gap-4 px-4 sm:flex-row sm:items-center', {
                'max-sm:border-b': !hasComfyCompactLayout,
                'pb-0 md:pb-6': !!member.user.cover_photo_url && viewportWidth > 1024,
                'py-4': !member.user.cover_photo_url && hasComfyCompactLayout,
                'border-b py-8 md:py-10': !member.user.cover_photo_url && !hasComfyCompactLayout,
                'py-4 md:py-6': !!member.user.cover_photo_url
              })}
            >
              <div className='flex items-center gap-4'>
                <MemberAvatar displayStatus member={member} size={viewportWidth > 1024 ? 'xxl' : 'xl'} />

                <div className='flex flex-1 flex-col justify-center gap-0.5'>
                  <h1 className='text-2xl font-bold'>{member.user.display_name}</h1>

                  {member.role === 'guest' && <GuestBadge className='self-start' />}

                  {!isCommunity && (
                    <button
                      className='text-left outline-none'
                      onClick={() => {
                        copy(member.user.email)
                        toast('Copied to clipboard')
                      }}
                    >
                      <UIText secondary className='cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap'>
                        {member.user.email}
                      </UIText>
                    </button>
                  )}

                  {member.deactivated && (
                    <div className='flex self-start'>
                      <Badge>Deactivated</Badge>
                    </div>
                  )}

                  {member.status && (
                    <span className='mt-1 flex items-center gap-2'>
                      <span className='font-["emoji"] text-base leading-none'>{member.status?.emoji}</span>
                      <span className='flex items-center gap-1'>
                        <UIText tertiary>{member.status?.message}</UIText>
                        <UIText quaternary>
                          {getTimestamp(
                            member.status?.expires_at ? new Date(member.status.expires_at) : null,
                            'relative'
                          )}
                        </UIText>
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <MemberChatButton member={member} />
            </div>
          </div>
        </>

        <div className='px-4 lg:px-6'>
          {hasComfyCompactLayout ? (
            <ComfyCompactFeed getPosts={getPosts} group='published_at' />
          ) : (
            <ComfortableFeed
              isWriteableForViewer={currentUser?.username === member?.user.username}
              getPosts={getPosts}
            />
          )}
        </div>
      </IndexPageContent>
    </>
  )
}
