import { useMemo } from 'react'
import { format } from 'date-fns'
import Image from 'next/image'

import { FollowUp } from '@campsite/types'
import { Avatar, Button, DotsHorizontal, UIText, VideoCameraIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { NotificationOverflowMenu } from '@/components/InboxItems/NotificationOverflowMenu'
import { useCanHover } from '@/hooks/useCanHover'

export function FollowUpListItem({ followUp }: { followUp: FollowUp }) {
  const canHover = useCanHover()

  const summary = useMemo(() => {
    return followUp.summary_blocks.map((block, i) => {
      if (block.text) {
        return (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className={cn({
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
  }, [followUp.summary_blocks])

  return (
    <>
      <FollowUpListItemLeadingAccessory followUp={followUp} />

      <div className='flex flex-1 flex-col'>
        <div
          className={cn('flex items-center justify-between gap-2 leading-tight', {
            // the button will be larger than the text, so optically align the first line better with the avatar
            '-mt-1': !canHover
          })}
        >
          <UIText element='span' inherit>
            {summary}
          </UIText>

          {!canHover && (
            <NotificationOverflowMenu item={followUp} type='dropdown'>
              <Button iconOnly={<DotsHorizontal />} variant='plain' accessibilityLabel='More options' />
            </NotificationOverflowMenu>
          )}
        </div>
        <div className='my-1 flex flex-col gap-y-1'>
          <div className={cn('flex border-l-2 pl-2 pr-3 leading-tight')}>
            <UIText element='span' secondary className='break-anywhere line-clamp-1'>
              {followUp.subject.body_preview}
            </UIText>
          </div>
        </div>
        <div className='flex flex-row items-center gap-2'>
          <UIText element='span' className={cn('text-amber-600')}>
            Follow up at {format(followUp.show_at, 'p')}
          </UIText>
        </div>
      </div>
    </>
  )
}

function FollowUpListItemLeadingAccessory({ followUp }: { followUp: FollowUp }) {
  if (followUp.subject.member) {
    return (
      <div className={cn('flex h-6 w-6 items-start justify-end')}>
        <Avatar
          name={followUp.subject.member.user.display_name}
          urls={followUp.subject.member.user.avatar_urls}
          size='sm'
          rounded={followUp.subject.member.user.integration ? 'rounded' : 'rounded-full'}
        />
      </div>
    )
  }

  if (followUp.subject.type === 'Call') {
    return <VideoCameraIcon size={24} />
  }

  return null
}
