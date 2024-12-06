import { AnimatePresence, m } from 'framer-motion'
import { isMobile } from 'react-device-detect'

import { Notification, SubjectFollowUp } from '@campsite/types/generated'
import {
  AlarmIcon,
  Avatar,
  Badge,
  Button,
  ChevronRightCircleIcon,
  cn,
  DotsHorizontal,
  FollowUpTag,
  LockIcon,
  RelativeTime,
  UIText,
  VideoCameraFilledIcon
} from '@campsite/ui'

import { reasonConfig, ReasonIcon } from '@/components/InboxItems/NotificationListItem'
import { NotificationOverflowMenu } from '@/components/InboxItems/NotificationOverflowMenu'
import { useCanHover } from '@/hooks/useCanHover'

interface InboxNotificationItemProps {
  notification: Notification
  variant?: 'plain' | 'group-parent' | 'group-child'
  groupSize?: number
  isGroupExpanded?: boolean
  toggleGroup?: () => void
}

export function InboxNotificationItem({
  notification,
  variant = 'plain',
  groupSize,
  isGroupExpanded,
  toggleGroup
}: InboxNotificationItemProps) {
  const viewerFollowUp = notification.follow_up_subject?.viewer_follow_up
  const canHover = useCanHover()

  return (
    <>
      <div className='pointer-events-none relative mt-0.5 flex items-start self-start'>
        {notification.reason === 'follow_up' ? (
          <AlarmIcon className={cn('text-secondary', { 'opacity-60': notification.read })} size={24} />
        ) : notification.target.type === 'Call' ? (
          <VideoCameraFilledIcon className={cn('text-green-500', { 'opacity-60': notification.read })} size={24} />
        ) : (
          <HomeAvatar notification={notification} />
        )}
      </div>

      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
        {/* Channel Byline */}
        <div
          className={cn(
            'text-tertiary flex items-center justify-between gap-2',
            'h-5', // makes the channel line the same height as the text, otherwise the button (30px tall) creates an extra gap
            {
              'text-quaternary': notification.read,
              hidden: variant === 'group-child'
            }
          )}
        >
          <div className='flex items-center gap-1'>
            {notification.target.project ? (
              <>
                {notification.target.project.accessory && (
                  <UIText className='mr-px font-["emoji"] text-xs leading-none'>
                    {notification.target.project.accessory}
                  </UIText>
                )}
                <UIText size='text-sm @xl:text-xs' inherit>
                  {notification.target.project.name}
                </UIText>
                {notification.target.project.private && <LockIcon size={14} className='opacity-80' />}
              </>
            ) : (
              <>
                <UIText size='text-sm @xl:text-xs' inherit>
                  Private
                </UIText>
                <LockIcon size={14} className='opacity-80' />
              </>
            )}
          </div>

          <div className='flex items-center gap-1'>
            <RelativeTime className='text-quaternary flex-shrink-0 text-sm' time={notification.created_at} />

            {!canHover && (
              <NotificationOverflowMenu item={notification} type='dropdown'>
                <Button iconOnly={<DotsHorizontal />} variant='plain' accessibilityLabel='More options' />
              </NotificationOverflowMenu>
            )}
          </div>
        </div>

        {/* Notification Title */}
        <div className={cn('@xl:flex-row flex flex-1 flex-col', { hidden: variant === 'group-child' })}>
          <div
            className={cn(
              'flex flex-shrink items-center',
              'h-5' // makes the title line the same height as the text, otherwise the button (30px tall) creates an extra gap
            )}
          >
            <StatusBadges resolved={notification.target.resolved} viewerFollowUp={viewerFollowUp} />

            <AnimatePresence initial={false}>
              {!notification.read && (
                <m.div
                  transition={{ duration: 0.15 }}
                  initial={{ opacity: 0, marginRight: -10 }}
                  animate={{ opacity: 1, marginRight: 6 }}
                  exit={{ opacity: 0, marginRight: -10 }}
                  className='h-2.5 w-2.5 flex-none rounded-full bg-blue-500'
                />
              )}
            </AnimatePresence>

            <UIText
              primary={!notification.read}
              tertiary={notification.read}
              weight={notification.read ? 'font-normal' : 'font-semibold'}
              className='break-anywhere mr-2 line-clamp-1'
            >
              {notification.target.title}
            </UIText>

            <span className='flex-1' aria-hidden />

            {variant == 'group-parent' && (
              <button
                className={cn(
                  'relative z-10 -mr-1 flex flex-row flex-nowrap gap-px pl-0.5 text-blue-500',
                  'focus:!outline-none focus:!ring-0 active:!outline-none active:!ring-0',
                  'after:pointer-events-none after:absolute after:-inset-[3px] after:rounded-lg after:border after:border-blue-500 after:opacity-0 after:ring-2 after:ring-blue-500/20 after:transition-opacity focus-visible:after:opacity-100 active:after:opacity-0'
                )}
                onClick={toggleGroup}
              >
                {/* expand hit area to minimum 30px on touch devices */}
                <span
                  className='absolute left-1/2 top-1/2 size-[max(100%,2rem)] -translate-x-1/2 -translate-y-1/2 [@media(pointer:fine)]:hidden'
                  aria-hidden='true'
                />

                <UIText element='span' weight='font-medium' className='text-blue-500'>
                  {groupSize}
                </UIText>
                <ChevronRightCircleIcon
                  className={cn('transition-transform duration-150', { 'rotate-90': isGroupExpanded })}
                />
              </button>
            )}
          </div>
        </div>

        {/* Notification Preview */}
        {notification.reply_to_body_preview && (
          <div className='mb-0.5 flex border-l-2 pl-2 pr-3 leading-tight'>
            <UIText element='span' quaternary className='break-anywhere line-clamp-1'>
              {notification.reply_to_body_preview}
            </UIText>
          </div>
        )}

        {variant == 'group-child' && notification.body_preview_prefix_fallback ? (
          <UIText
            element='span'
            className={cn('break-anywhere text-secondary line-clamp-2 text-ellipsis', {
              'text-quaternary': notification.read
            })}
          >
            {notification.body_preview_prefix_fallback}
          </UIText>
        ) : notification.body_preview ? (
          <UIText
            element='span'
            className={cn('break-anywhere text-secondary line-clamp-2 text-ellipsis', {
              'text-quaternary': notification.read
            })}
          >
            {notification.body_preview_prefix
              ? `${notification.body_preview_prefix}: ${notification.body_preview}`
              : notification.body_preview}
          </UIText>
        ) : null}
      </div>
    </>
  )
}

function HomeAvatar({ notification }: { notification: Notification }) {
  const isIntegration = notification.actor.integration
  const reason = reasonConfig({
    reason: notification.reason,
    subjectType: notification.subject.type,
    size: 'sm',
    isReplying: !!notification.reply_to_body_preview
  })

  return (
    <>
      <Avatar
        urls={notification.actor.avatar_urls}
        name={notification.actor.display_name}
        size='sm'
        rounded={isIntegration ? 'rounded-md' : undefined}
        clip={reason ? (isIntegration ? 'notificationReasonSquare' : 'notificationReason') : undefined}
      />
      {reason && <ReasonIcon config={reason} />}
    </>
  )
}

function StatusBadges({ resolved, viewerFollowUp }: { resolved: boolean; viewerFollowUp?: SubjectFollowUp | null }) {
  const badge = resolved ? (
    <Badge color='green' className='font-mono'>
      Resolved
    </Badge>
  ) : viewerFollowUp ? (
    <FollowUpTag followUpAt={viewerFollowUp.show_at} />
  ) : null

  if (!badge) {
    return null
  }

  return <div className={cn('mr-2 flex shrink-0 items-center gap-1', !isMobile && 'relative')}>{badge}</div>
}
