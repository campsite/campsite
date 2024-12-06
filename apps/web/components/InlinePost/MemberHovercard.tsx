import { useEffect, useState } from 'react'
import * as HoverCard from '@radix-ui/react-hover-card'
import { Portal } from '@radix-ui/react-portal'
import { AnimatePresence, m } from 'framer-motion'
import toast from 'react-hot-toast'

import {
  ANIMATION_CONSTANTS,
  Badge,
  Button,
  ClockIcon,
  cn,
  CopyIcon,
  Link,
  LoadingSpinner,
  MailIcon,
  MoonFilledIcon,
  Tooltip,
  UIText,
  useCopyToClipboard
} from '@campsite/ui'

import { MemberChatButton } from '@/components/Chat/MemberChatButton'
import { GuestBadge } from '@/components/GuestBadge'
import { MemberAvatar } from '@/components/MemberAvatar'
import { MemberLocalTime } from '@/components/MemberLocalTime'
import { MemberStatusTimeRemaining } from '@/components/MemberStatus'
import { useScope } from '@/contexts/scope'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetOrganizationMember } from '@/hooks/useGetOrganizationMember'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { useMentionInteraction } from '@/hooks/useMentionInteraction'

export function MemberHovercard({
  username,
  role,
  children,
  side = 'bottom',
  align = 'start',
  forceOpen = false,
  onMouseOver,
  onMouseOut
}: {
  username: string
  role?: string
  children?: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'end' | 'center'
  forceOpen?: boolean
  onMouseOver?: () => void
  onMouseOut?: () => void
}) {
  const { scope } = useScope()
  const [open, setOpen] = useState(forceOpen)
  const isIntegration = role === 'app'
  const getMember = useGetOrganizationMember({ username, enabled: open && !isIntegration })
  const member = getMember.data
  const isCommunity = useIsCommunity()
  const [copy] = useCopyToClipboard()
  const { data: currentUser } = useGetCurrentUser()
  const viewerIsCurrentUser = currentUser?.username === username

  if (!username || isIntegration) return children

  return (
    <HoverCard.Root open={open} onOpenChange={setOpen} openDelay={200} closeDelay={200}>
      <HoverCard.Trigger asChild>
        <span>{children}</span>
      </HoverCard.Trigger>

      <AnimatePresence>
        {open && (
          <HoverCard.Portal>
            <HoverCard.Content
              hideWhenDetached
              side={side}
              align={align}
              sideOffset={4}
              collisionPadding={8}
              className='relative'
              onMouseOver={onMouseOver}
              onMouseOut={onMouseOut}
            >
              <m.div
                {...ANIMATION_CONSTANTS}
                className='border-primary-opaque bg-elevated w-[312px] origin-[--radix-hover-card-content-transform-origin] overflow-hidden rounded-lg border shadow max-md:hidden dark:shadow-[0px_0px_0px_0.5px_rgba(0,0,0,1),_0px_4px_4px_rgba(0,0,0,0.24)]'
              >
                {member && (
                  <div className='flex flex-col'>
                    {member.deactivated && (
                      <div className='-mb-1 p-1'>
                        <Badge className={cn('flex-1 rounded-t-md py-1.5', {})}>Deactivated</Badge>
                      </div>
                    )}
                    {member.role === 'guest' && !member.deactivated && (
                      <div className='-mb-1 p-1'>
                        <GuestBadge className={cn('flex-1 rounded-t-md py-1.5')} />
                      </div>
                    )}
                    <Link href={`/${scope}/people/${member.user.username}`} className='flex items-center gap-3 p-3'>
                      <MemberAvatar displayStatus member={member} size='lg' />

                      <div className='flex min-w-0 flex-col gap-0.5'>
                        <div className='relative flex items-center gap-1.5'>
                          <UIText weight='font-medium' className='-mb-0.5 line-clamp-1 text-[15px] leading-tight'>
                            {member.user.display_name}
                          </UIText>
                        </div>
                        {member.status && (
                          <UIText tertiary className='flex items-center gap-1' size='text-[13px]'>
                            {member.status.emoji} {member.status.message}{' '}
                            <MemberStatusTimeRemaining status={member.status} />
                          </UIText>
                        )}
                      </div>
                    </Link>

                    <div className='grid auto-rows-[28px] border-t px-3 py-2'>
                      {member.user.notifications_paused && (
                        <div className='flex items-center gap-1.5 text-violet-500 dark:text-violet-400'>
                          <MoonFilledIcon className='text-violet-500 dark:text-violet-500' />
                          <UIText inherit>Notifications paused</UIText>
                        </div>
                      )}

                      {member.user.timezone && (
                        <div className='text-tertiary flex items-center gap-1.5'>
                          <ClockIcon className='text-quaternary' />
                          <UIText>
                            <MemberLocalTime timezone={member.user.timezone} /> local time
                          </UIText>
                        </div>
                      )}

                      {!isCommunity && (
                        <div className='group/email text-tertiary flex flex-1 items-center gap-1.5'>
                          <MailIcon className='text-quaternary' />
                          <Tooltip label={member.user.email}>
                            <button
                              className='relative line-clamp-1 flex min-w-0 text-left'
                              onClick={() => {
                                copy(member.user.email)
                                toast('Copied to clipboard')
                              }}
                            >
                              <UIText inherit className='flex-1 truncate'>
                                {member.user.email}
                              </UIText>
                            </button>
                          </Tooltip>
                          <Button
                            size='sm'
                            variant='plain'
                            onClick={() => {
                              copy(member.user.email)
                              toast('Copied to clipboard')
                            }}
                            iconOnly={<CopyIcon size={16} />}
                            accessibilityLabel='Copy'
                            tooltip='Copy email'
                            className='opacity-0 group-hover/email:opacity-100'
                          />
                        </div>
                      )}
                    </div>

                    {!member.deactivated && !viewerIsCurrentUser && (
                      <div className='p-3 pt-0'>
                        <MemberChatButton fullWidth member={member} />
                      </div>
                    )}
                  </div>
                )}

                {!member && (
                  <div className='flex items-center justify-center p-6'>
                    <LoadingSpinner />
                  </div>
                )}
              </m.div>
            </HoverCard.Content>
          </HoverCard.Portal>
        )}
      </AnimatePresence>
    </HoverCard.Root>
  )
}

const onHoverDelay = 400
const offHoverDelay = 300

export function MentionInteractivity({
  container,
  highlightSelfMention = true
}: {
  container: React.RefObject<HTMLElement>
  highlightSelfMention?: boolean
}) {
  const hoveredMention = useMentionInteraction(container)
  const username = useGetCurrentUser().data?.username

  // activeMention has a delay, while hoveredMention is instant
  const [activeMention, setActiveMention] = useState<HTMLElement | null>(null)
  const [isMouseOverHovercard, setIsMouseOverHovercard] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isMouseOverHovercard) return

    if (hoveredMention) {
      timeout = setTimeout(() => {
        setActiveMention(hoveredMention)
      }, onHoverDelay)
    } else {
      timeout = setTimeout(() => {
        setActiveMention(null)
      }, offHoverDelay)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [hoveredMention, isMouseOverHovercard])

  return (
    <>
      {highlightSelfMention && (
        <style>
          {`
            span[data-type="mention"][data-username="${username}"] {
              background: var(--bg-highlight);
              color: var(--text-highlight);
              border-radius: 4px;
              padding: 2px;
            }
          `}
        </style>
      )}
      {activeMention && (
        <Portal container={activeMention} asChild>
          <MemberHovercard
            align='center'
            forceOpen
            username={activeMention?.getAttribute('data-username') ?? ''}
            role={activeMention?.getAttribute('data-role') ?? 'member'}
            onMouseOver={() => setIsMouseOverHovercard(true)}
            onMouseOut={() => setIsMouseOverHovercard(false)}
          />
        </Portal>
      )}
    </>
  )
}
