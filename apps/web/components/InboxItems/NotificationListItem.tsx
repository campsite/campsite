import { ReactNode, useMemo } from 'react'
import Image from 'next/image'

import { Notification } from '@campsite/types'
import {
  AlarmIcon,
  AtSignIcon,
  Avatar,
  Button,
  CanvasCommentIcon,
  CheckIcon,
  DotsHorizontal,
  NoteFilledIcon,
  ProjectIcon,
  QuestionMarkIcon,
  QuoteIcon,
  RefreshIcon,
  RelativeTime,
  Reply2Icon,
  UIText,
  VideoCameraIcon
} from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { NotificationOverflowMenu } from '@/components/InboxItems/NotificationOverflowMenu'
import { useCanHover } from '@/hooks/useCanHover'

interface Props {
  notification: Notification
  display?: 'activity' | 'home'
}

export function NotificationListItem({ notification, display = 'home' }: Props) {
  const canHover = useCanHover()

  const summary = useMemo(() => {
    return notification.summary_blocks.map((block, i) => {
      if (block.text) {
        return (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={cn('pointer-events-none', {
              'font-medium': block.text.bold,
              'whitespace-nowrap': block.text.nowrap,
              'text-secondary': !block.text.bold
            })}
          >
            {block.text.content}
          </span>
        )
      }
      if (block.img) {
        return (
          <Image
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className='inline-block'
            src={block.img.src}
            alt={block.img.alt}
            width={16}
            height={16}
          />
        )
      }
      return null
    })
  }, [notification.summary_blocks])

  return (
    <>
      <NotificationListItemLeftSlot notification={notification} />

      <div className='pointer-events-none flex flex-1 flex-col'>
        <div
          className={cn('flex items-center justify-between gap-2 leading-tight', {
            // the button will be larger than the text, so optically align the first line better with the avatar
            '-mt-1': display === 'home' && !canHover,
            'opacity-60': display !== 'activity' && notification.read,
            'pt-0.5': display === 'activity'
          })}
        >
          <UIText element='span' inherit className='break-anywhere leading-tight'>
            {summary}
            {display === 'activity' && (
              <>
                {' '}
                <RelativeTime className='text-secondary text-sm' time={notification.created_at} />
              </>
            )}
          </UIText>

          {display === 'home' && !canHover && (
            <NotificationOverflowMenu item={notification} type='dropdown'>
              <Button
                className='pointer-events-auto'
                iconOnly={<DotsHorizontal />}
                variant='plain'
                accessibilityLabel='More options'
              />
            </NotificationOverflowMenu>
          )}
        </div>

        {(notification.reply_to_body_preview || notification.body_preview) && (
          <div className='my-1 flex flex-col gap-y-1'>
            {notification.reply_to_body_preview && (
              <div
                className={cn('flex border-l-2 pl-2 pr-3 leading-tight', {
                  'opacity-60': display !== 'activity' && notification.read
                })}
              >
                <UIText element='span' secondary className='break-anywhere line-clamp-1'>
                  {notification.reply_to_body_preview}
                </UIText>
              </div>
            )}
            {notification.body_preview && (
              <div
                className={cn('flex leading-tight', {
                  'opacity-60': display !== 'activity' && notification.read
                })}
              >
                <UIText element='span' secondary className='break-anywhere line-clamp-1'>
                  {notification.body_preview}
                </UIText>
              </div>
            )}
          </div>
        )}

        {display !== 'activity' && (
          <div className='flex flex-row items-center gap-2'>
            {!notification.read && <div className={'h-2 w-2 flex-none rounded-full bg-blue-500'} />}
            <UIText element='span' tertiary className={cn(notification.read && 'opacity-50')}>
              <RelativeTime time={notification.created_at} />
            </UIText>
          </div>
        )}
      </div>

      {display !== 'activity' && notification.preview_url && (
        <div className='relative'>
          <Image
            className='bg-tertiary hidden aspect-square h-12 w-12 flex-none rounded-lg object-cover ring-1 ring-black/5 sm:inline-block dark:ring-white/5'
            src={notification.preview_url}
            width={48}
            height={48}
            alt='Notification preview image'
          />
          {notification.preview_is_canvas && (
            <div className='text-secondary absolute bottom-1 right-1 flex items-center justify-center rounded-md bg-white px-1 py-0.5 ring-1 ring-black/5'>
              <CanvasCommentIcon size={14} />
            </div>
          )}
        </div>
      )}
    </>
  )
}

function NotificationListItemLeftSlot({ notification }: { notification: Notification }) {
  if (notification.subject.type === 'Reaction') {
    return (
      <div className='flex h-6 w-6 items-center justify-center'>
        {notification.reaction?.content && (
          <span className='font-["emoji"] text-[22px] leading-6'>{notification.reaction.content}</span>
        )}
        {notification.reaction?.custom_content && (
          <Image
            src={notification.reaction.custom_content.file_url}
            alt={notification.reaction.custom_content.name}
            width={20}
            height={20}
          />
        )}
      </div>
    )
  }

  if (notification.subject.type === 'FollowUp') {
    return (
      <div className='flex h-6 w-6 items-start justify-end'>
        <AlarmIcon className='text-secondary' size={24} />
      </div>
    )
  }

  if (notification.subject.type === 'Call') {
    return (
      <div className='flex h-6 w-6 items-start justify-end'>
        <VideoCameraIcon className='text-secondary' size={24} />
      </div>
    )
  }

  const reason = reasonConfig({
    reason: notification.reason,
    subjectType: notification.subject.type,
    targetType: notification.target?.type,
    size: 'sm'
  })

  return (
    <div className='pointer-events-none relative'>
      <Avatar
        name={notification.actor.display_name}
        urls={notification.actor.avatar_urls}
        size='sm'
        rounded={notification.actor.integration ? 'rounded' : 'rounded-full'}
        clip={reason ? (notification.actor.integration ? 'notificationReasonSquare' : 'notificationReason') : undefined}
      />
      {reason && <ReasonIcon config={reason} />}
    </div>
  )
}

interface ReasonConfig {
  icon: ReactNode
  classes: string
}

export function reasonConfig({
  reason,
  subjectType,
  targetType,
  size = 'sm',
  isReplying = false
}: {
  reason: Notification['reason']
  size?: 'sm' | 'base'
  subjectType?: Notification['subject']['type']
  targetType?: Notification['target']['type']
  isReplying?: boolean
}): ReasonConfig | undefined {
  const config = (() => {
    switch (reason) {
      case 'mention':
        return {
          icon: <AtSignIcon size={size === 'sm' ? 14 : 18} strokeWidth='2' />,
          classes: 'bg-yellow-500/40 text-yellow-900 dark:text-yellow-100'
        }
      case 'comment_resolved':
        return {
          icon: <CheckIcon size={size === 'sm' ? 12 : 16} strokeWidth='2.5' />,
          classes: 'bg-blue-500 text-white'
        }
      case 'feedback_requested':
        return {
          icon: <QuestionMarkIcon size={size === 'sm' ? 11 : 15} strokeWidth='3' />,
          classes: 'bg-brand-primary text-white'
        }
      case 'post_resolved':
      case 'post_resolved_from_comment':
        return {
          icon: <CheckIcon size={size === 'sm' ? 12 : 16} strokeWidth='2.5' />,
          classes: 'bg-green-500 dark:bg-green-600 text-white'
        }
      case 'parent_subscription':
        if (subjectType === 'Post') {
          return {
            icon: <RefreshIcon size={size === 'sm' ? 14 : 16} strokeWidth='2' />,
            classes: 'bg-black/10 dark:bg-white/15 text-secondary'
          }
        } else if (subjectType === 'Comment') {
          if (isReplying) {
            return {
              icon: <Reply2Icon size={size === 'sm' ? 14 : 16} />,
              classes: 'bg-black/10 dark:bg-white/15 text-secondary'
            }
          }
          return {
            icon: <QuoteIcon size={size === 'sm' ? 14 : 16} />,
            classes: 'bg-black/10 dark:bg-white/15 text-secondary'
          }
        }
        break
      case 'permission_granted':
        if (targetType === 'Note') {
          return { icon: <NoteFilledIcon size={14} />, classes: 'bg-blue-500 text-white' }
        } else if (targetType === 'Project') {
          return {
            icon: <ProjectIcon size={size === 'sm' ? 14 : 16} strokeWidth='2' />,
            classes: 'bg-black/10 dark:bg-white/15 text-secondary'
          }
        }
    }
  })()

  if (!config) return

  return {
    icon: config.icon,
    classes: cn(config.classes, size === 'sm' ? 'h-4 w-4' : 'h-5 w-5')
  }
}

export function ReasonIcon({ config }: { config: ReasonConfig }) {
  return (
    <div
      className={cn(
        'absolute -bottom-[5px] -right-[5px] flex items-center justify-center rounded-full',
        config.classes
      )}
    >
      {config.icon}
    </div>
  )
}
