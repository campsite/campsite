import { memo, useMemo, useState } from 'react'
import Image from 'next/image'

import { MoonFilledIcon } from '../Icons'
import { Link } from '../Link'
import { UIText } from '../Text'
import { Tooltip } from '../Tooltip'
import { cn, ConditionalWrap } from '../utils'
import { AvatarFacepileClip } from './AvatarFacepileClip'
import { AvatarNotificationReasonClip } from './AvatarNotificationReasonClip'
import { AvatarNotificationReasonSquareClip } from './AvatarNotificationReasonSquareClip'
import { AvatarOnlineClip } from './AvatarOnlineClip'

interface Urls {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  xxl: string
}

interface Props {
  clip?: 'facepile' | 'notificationReason' | 'notificationReasonSquare'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | 'xxl'
  alt?: string | null
  name?: string | null
  src?: string | null
  urls?: Urls | null
  href?: string | null
  tooltip?: string | null
  tooltipDelayDuration?: number
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
  online?: boolean
  notificationsPaused?: boolean
  fade?: boolean
  deactivated?: boolean
  rounded?: string
}

const COLORS = [
  'bg-blue-300 text-blue-800',
  'bg-green-300 text-green-800',
  'bg-yellow-300 text-yellow-800',
  'bg-red-300 text-red-800',
  'bg-purple-300 text-purple-800',
  'bg-pink-300 text-pink-800',
  'bg-indigo-300 text-indigo-800',
  'bg-teal-300 text-teal-800'
]

const SIZES = {
  xs: 20,
  sm: 24,
  base: 32,
  lg: 40,
  xl: 64,
  xxl: 112
}

const TEXT_SIZES = {
  xs: 'text-[10px]',
  sm: 'text-[12px]',
  base: 'text-[14px]',
  lg: 'text-[20px]',
  xl: 'text-[32px]',
  xxl: 'text-[44px]'
}

const FACEPILE_CLIP_IDS = {
  xs: 'facePileAvatarMaskXS',
  sm: 'facePileAvatarMaskSM',
  base: 'facePileAvatarMaskBase',
  lg: 'facePileAvatarMaskLG',
  xl: 'facePileAvatarMaskXL',
  xxl: 'facePileAvatarMaskXXL'
}

const STATUS_CLIP_IDS = {
  xs: 'onlineAvatarMaskXS',
  sm: 'onlineAvatarMaskSM',
  base: 'onlineAvatarMaskBase',
  lg: 'onlineAvatarMaskLG',
  xl: 'onlineAvatarMaskXL',
  xxl: 'onlineAvatarMaskXXL'
}

const NOTIFICATION_REASON_CLIP_IDS = {
  xs: 'notificationReasonAvatarMaskXS',
  sm: 'notificationReasonAvatarMaskSM',
  base: 'notificationReasonAvatarMaskBase',
  lg: 'notificationReasonAvatarMaskLG',
  xl: 'notificationReasonAvatarMaskXL',
  xxl: 'notificationReasonAvatarMaskXXL'
}

const NOTIFICATION_REASON_SQUARE_CLIP_IDS = {
  xs: 'notificationReasonSquareAvatarMaskXS',
  sm: 'notificationReasonSquareAvatarMaskSM',
  base: 'notificationReasonSquareAvatarMaskBase',
  lg: 'notificationReasonSquareAvatarMaskLG',
  xl: 'notificationReasonSquareAvatarMaskXL',
  xxl: 'notificationReasonSquareAvatarMaskXXL'
}

const ONLINE_POSITION = {
  xs: 'bottom-px right-px',
  sm: 'bottom-px right-px',
  base: 'bottom-px right-px',
  lg: 'bottom-0.5 right-0.5',
  xl: 'bottom-1 right-1',
  xxl: 'bottom-2.5 right-2.5'
}

const ONLINE_SIZE = {
  xs: 'w-[5px] h-[5px]',
  sm: 'h-[7px] w-[7px]',
  base: 'h-2 w-2',
  lg: 'h-2.5 w-2.5',
  xl: 'h-3 w-3',
  xxl: 'h-3.5 w-3.5'
}

const DND_POSITION = {
  xs: '-bottom-[3px] -right-[3.5px]',
  sm: '-bottom-[4px] -right-[4.5px]',
  base: '-bottom-[5px] -right-[5.5px]',
  lg: '-bottom-[5px] -right-[5px]',
  xl: '-bottom-[5px] -right-[5px]',
  xxl: '-bottom-[3px] -right-[5px]'
}

const DND_SIZE = {
  xs: 12,
  sm: 15,
  base: 18,
  lg: 22,
  xl: 28,
  xxl: 38
}

/** ```ts
    stacked?: boolean;
    size?: "xs" | "sm" | "base" | "lg" | "xl" | "xxl"
    name: string;
    src?: string;
    alt?: string;
    href?: string;
  ``` */
function _Avatar(props: Props) {
  const {
    online = false,
    notificationsPaused = false,
    clip,
    size = 'base',
    name,
    src,
    urls,
    alt = '',
    href,
    tooltip,
    tooltipDelayDuration,
    tooltipSide = 'top',
    fade,
    deactivated,
    rounded = 'rounded-full'
  } = props

  const [imageErrored, setImageErrored] = useState(false)
  const avatarSize = SIZES[size]
  const url = urls?.[size] || src
  const showImage = url && !imageErrored
  const textSize = TEXT_SIZES[size]
  const colorIndex = (name || '').charCodeAt(0) % COLORS.length
  const accentBackgroundColor = COLORS[colorIndex]
  const facepileClipId = FACEPILE_CLIP_IDS[size]
  const onlineClipId = STATUS_CLIP_IDS[size]
  const NotificationReasonClipId = NOTIFICATION_REASON_CLIP_IDS[size]
  const NotificationReasonSquareClipId = NOTIFICATION_REASON_SQUARE_CLIP_IDS[size]

  const clipId = useMemo(() => {
    if (clip === 'facepile') return facepileClipId
    if (clip === 'notificationReason') return NotificationReasonClipId
    if (clip === 'notificationReasonSquare') return NotificationReasonSquareClipId
    if (online || notificationsPaused) return onlineClipId
    return undefined
  }, [
    clip,
    facepileClipId,
    NotificationReasonClipId,
    NotificationReasonSquareClipId,
    online,
    notificationsPaused,
    onlineClipId
  ])

  return (
    <ConditionalWrap condition={!!href} wrap={(children) => <Link href={href as string}>{children}</Link>}>
      <ConditionalWrap
        condition={!!tooltip}
        wrap={(children) => (
          <Tooltip delayDuration={tooltipDelayDuration} disableHoverableContent label={tooltip} side={tooltipSide}>
            {children}
          </Tooltip>
        )}
      >
        <span
          className='relative flex shrink-0 select-none'
          style={{
            minWidth: `${avatarSize}px`,
            width: `${avatarSize}px`,
            height: `${avatarSize}px`
          }}
        >
          <span
            style={{
              minWidth: `${avatarSize}px`,
              width: `${avatarSize}px`,
              height: `${avatarSize}px`,
              clipPath: clipId ? `url(#${clipId})` : undefined,
              // prevents broken clip path in Safari
              transform: clipId ? 'translateZ(0)' : undefined
            }}
            className={cn(
              'relative flex shrink-0 select-none items-center justify-center font-semibold',
              !showImage && accentBackgroundColor,
              textSize,
              fade && 'opacity-50 saturate-[10%]',
              deactivated && 'saturate-[10%]',
              rounded,
              showImage && 'border border-black/10 dark:border-white/5',
              // prevents broken clip path in Safari
              clipId && 'will-change-transform'
            )}
          >
            {showImage && (
              <Image
                className={cn('absolute inset-0 aspect-square object-cover', rounded)}
                alt={alt || `Avatar image of ${name}`}
                width={avatarSize}
                height={avatarSize}
                src={url}
                draggable={false}
                onError={() => setImageErrored(true)}
              />
            )}

            {!showImage && (
              <span className='text-dark flex text-opacity-60'>
                <UIText inherit className='mix-blend-color-burn saturate-150' weight='font-medium' size={textSize}>
                  {name?.slice(0, 1).toUpperCase()}
                </UIText>
              </span>
            )}

            <ClipComponent {...props} />
          </span>

          {online && !notificationsPaused && !clip && (
            <div className={cn('absolute rounded-full bg-green-500', ONLINE_POSITION[size], ONLINE_SIZE[size])} />
          )}

          {notificationsPaused && !clip && (
            <MoonFilledIcon size={DND_SIZE[size]} className={cn('absolute text-violet-500', DND_POSITION[size])} />
          )}
        </span>
      </ConditionalWrap>
    </ConditionalWrap>
  )
}

function ClipComponent({ size = 'base', ...props }: Props) {
  const facepileClipId = FACEPILE_CLIP_IDS[size]
  const statusClipId = STATUS_CLIP_IDS[size]
  const notificationReasonClipId = NOTIFICATION_REASON_CLIP_IDS[size]
  const notificationReasonSquareClipId = NOTIFICATION_REASON_SQUARE_CLIP_IDS[size]

  if (props.online || props.notificationsPaused) {
    return <AvatarOnlineClip size={size} clipId={statusClipId} />
  } else if (props.clip === 'facepile') {
    return <AvatarFacepileClip size={size} clipId={facepileClipId} />
  } else if (props.clip === 'notificationReason') {
    return <AvatarNotificationReasonClip size={size} clipId={notificationReasonClipId} />
  } else if (props.clip === 'notificationReasonSquare') {
    return <AvatarNotificationReasonSquareClip size={size} clipId={notificationReasonSquareClipId} />
  }

  return undefined
}

export const Avatar = memo(_Avatar)
