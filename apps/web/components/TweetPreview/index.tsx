import { ReactNode } from 'react'
import { format } from 'date-fns'
import Image from 'next/image'
import {
  EnrichedQuotedTweet,
  EnrichedTweet,
  enrichTweet,
  TweetBody,
  TweetInReplyTo,
  TweetMedia,
  useTweet,
  Verified,
  VerifiedBusiness,
  VerifiedGovernment,
  type TweetProps,
  type TwitterComponents
} from 'react-tweet'
import { TweetUser, type Tweet as TweetType } from 'react-tweet/api'

import { AlertIcon, UIText } from '@campsite/ui'
import { useHasMounted } from '@campsite/ui/src/hooks'
import { cn } from '@campsite/ui/src/utils'

function TweetContainer({
  className,
  children,
  tweet
}: {
  className?: string
  children: ReactNode
  tweet: EnrichedTweet
}) {
  return (
    <div
      onClickCapture={(evt) => {
        const didClickLinkOrButton =
          evt.target instanceof Element && (evt.target.closest('a') || evt.target.closest('button'))

        if (didClickLinkOrButton) return

        window.open(tweet.url, '_blank')
      }}
      className={cn(
        'tweet bg-primary not-prose border-primary-opaque relative flex flex-1 rounded-xl border p-4 transition-all active:scale-[0.99]',
        className
      )}
    >
      <article className='relative z-[1] min-w-0 flex-1'>{children}</article>
    </div>
  )
}

function TweetHeader({ tweet }: { tweet: EnrichedTweet }) {
  const { user } = tweet

  const isBusiness =
    user.verified_type === 'Business' || user.verified_type === 'Government' || user.profile_image_shape === 'Square'
  const isUser = user.profile_image_shape === 'Circle' || (!user.profile_image_shape && !isBusiness)

  return (
    <div className='flex items-center gap-3 pb-3'>
      <a href={tweet.url} className='' target='_blank' rel='noopener noreferrer'>
        <div
          className={cn('overflow-hidden', {
            'rounded-md': isBusiness,
            'rounded-full': isUser
          })}
        >
          <Image
            className={cn('h-11 w-11', {
              // opened a PR https://github.com/vercel/react-tweet/pull/142
              // @ts-ignore — react-tweet doesn't include hexagon as a valid profile image shape
              'clip-path-hexagon': user.profile_image_shape === 'Hexagon'
            })}
            src={user.profile_image_url_https}
            alt={user.name}
            width={176}
            height={176}
          />
        </div>
      </a>
      <div className='flex flex-1 flex-col gap-0.5'>
        <a
          href={tweet.url}
          className='flex flex-1 items-center gap-0.5 leading-none'
          target='_blank'
          rel='noopener noreferrer'
        >
          <span className='text-primary text-[15px] font-semibold'>
            <span title={user.name}>{user.name}</span>
          </span>
          <VerifiedBadge user={user} />
        </a>
        <a
          href={tweet.url}
          className='text-tertiary text-[15px] leading-none'
          target='_blank'
          rel='noopener noreferrer'
        >
          <span title={`@${user.screen_name}`}>@{user.screen_name}</span>
        </a>
      </div>
    </div>
  )
}

interface VerifiedBadgeProps {
  user: TweetUser
  className?: string
}

function VerifiedBadge({ user, className }: VerifiedBadgeProps) {
  const verified = user.verified || user.is_blue_verified || user.verified_type
  let icon = <Verified />
  let iconClassName: string | null = 'text-[rgb(29,155,240)]'

  if (verified) {
    if (!user.is_blue_verified) {
      iconClassName = 'text-[rgb(29,155,240)]'
    }
    switch (user.verified_type) {
      case 'Government':
        icon = <VerifiedGovernment />
        iconClassName = 'text-[rgb(130,154,171)]'
        break
      case 'Business':
        icon = <VerifiedBusiness />
        iconClassName = null
        break
    }
  }

  return verified ? <div className={cn(className, iconClassName)}>{icon}</div> : null
}

function TweetInfoCreatedAt({ tweet }: { tweet: EnrichedTweet }) {
  const mounted = useHasMounted()
  // If the date is displayed immediately, it will produce a server/client mismatch because the date
  // format will change depending on the user's browser. If the format were to be simplified to
  // something like "MMM d, y", then you could use the server date.
  const createdAt = typeof window !== 'undefined' && mounted ? new Date(tweet.created_at) : null

  return !createdAt ? null : (
    <a
      className={'text-tertiary -mb-1 mt-3 flex items-center text-sm hover:underline'}
      href={tweet.url}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={format(createdAt, 'h:mm a · MMM d, y')}
    >
      <time dateTime={createdAt.toISOString()}>{format(createdAt, 'h:mm a · MMM d, y')}</time>
    </a>
  )
}

function QuotedTweetHeader({ tweet }: { tweet: EnrichedQuotedTweet }) {
  const { user } = tweet

  const isBusiness =
    user.verified_type === 'Business' || user.verified_type === 'Government' || user.profile_image_shape === 'Square'
  const isUser = user.profile_image_shape === 'Circle' || (!user.profile_image_shape && !isBusiness)

  return (
    <div className='mb-2 flex gap-2 overflow-hidden whitespace-nowrap break-words'>
      <a className='h-5 w-5 flex-none' href={tweet.url} target='_blank' rel='noopener noreferrer'>
        <div
          className={cn('overflow-hidden', {
            rounded: isBusiness,
            'rounded-full': isUser
          })}
        >
          <Image src={user.profile_image_url_https} alt={user.name} width={20} height={20} />
        </div>
      </a>
      <div className='flex items-center gap-1 truncate'>
        <div className='text-primary min-w-0 truncate text-[15px] font-semibold'>
          <span title={user.name}>{user.name}</span>
        </div>
        <VerifiedBadge user={user} />
        <div className='text-tertiary min-w-0 truncate text-[15px]'>
          <span title={`@${user.screen_name}`}>@{user.screen_name}</span>
        </div>
      </div>
    </div>
  )
}

function QuotedTweetBody({ tweet }: { tweet: EnrichedQuotedTweet }) {
  return (
    <p className='not-prose m-0 whitespace-pre-wrap break-words text-[15px] font-normal leading-normal'>
      {tweet.entities.map((item, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className='not-prose' dangerouslySetInnerHTML={{ __html: item.text }} />
      ))}
    </p>
  )
}

function QuotedTweetContainer({ tweet, children }: { tweet: EnrichedQuotedTweet; children: ReactNode }) {
  return (
    <div
      className='hover:bg-secondary my-4 w-full overflow-hidden rounded-xl border p-3'
      onClick={(e) => {
        e.preventDefault()
        window.open(tweet.url, '_blank')
      }}
    >
      <article className='relative'>{children}</article>
    </div>
  )
}

function QuotedTweet({ tweet }: { tweet: EnrichedQuotedTweet }) {
  return (
    <QuotedTweetContainer tweet={tweet}>
      <QuotedTweetHeader tweet={tweet} />
      <QuotedTweetBody tweet={tweet} />
      {tweet.mediaDetails?.length ? (
        <div className='tweet-media-max-height'>
          <TweetMedia quoted tweet={tweet} />
        </div>
      ) : null}
    </QuotedTweetContainer>
  )
}

function CustomTweet({
  className,
  tweet: t,
  components
}: {
  className?: string
  tweet: TweetType
  components?: TwitterComponents
}) {
  const tweet = enrichTweet(t)

  return (
    <TweetContainer className={className} tweet={tweet}>
      <TweetHeader tweet={tweet} />
      {tweet.in_reply_to_status_id_str && (
        <div className='pb-1.5'>
          <TweetInReplyTo tweet={tweet} />
        </div>
      )}
      <TweetBody tweet={tweet} />
      {tweet.mediaDetails?.length ? (
        <div className='tweet-media-max-height'>
          <TweetMedia tweet={tweet} components={components} />
        </div>
      ) : null}
      {tweet.quoted_tweet && (
        <div className='quoted-tweet relative mt-3 block rounded-lg'>
          <QuotedTweet tweet={tweet.quoted_tweet} />
          {tweet.quoted_tweet.url && (
            <a href={tweet.quoted_tweet.url} className='absolute inset-0' target='_blank' rel='noopener noreferrer' />
          )}
        </div>
      )}
      <TweetInfoCreatedAt tweet={tweet} />
    </TweetContainer>
  )
}

function TweetSkeleton() {
  return (
    <div className='tweet relative w-full flex-1 rounded-xl border p-4 transition-all active:scale-[0.99]'>
      <div className='flex items-center gap-3'>
        <div className='bg-tertiary h-11 w-11 rounded-full' />
        <div className='flex flex-1 flex-col gap-1'>
          <div className='bg-tertiary h-3 rounded-full' />
          <div className='bg-tertiary h-3 w-1/2 rounded-full' />
        </div>
      </div>
      <div className='bg-tertiary mt-3 rounded-lg p-20' />
      <div className='bg-tertiary mt-3 h-3 w-1/2 rounded-full' />
    </div>
  )
}

function TweetTombstone({ text }: { text: string }) {
  return (
    <div className='tweet relative rounded-xl border p-3 transition-all active:scale-[0.99]'>
      <div className='flex items-center gap-3 rounded-lg'>
        <AlertIcon size={32} className='text-quaternary flex-none' />
        <UIText className='!my-0' tertiary>
          {text.replace('Learn more', '')}
        </UIText>
      </div>
    </div>
  )
}

interface Tombstone {
  text: {
    text: string
    entities: any
    rtl: boolean
  }
}

interface ExtendedTweet {
  data: (TweetType & { tombstone?: Tombstone }) | undefined | null
  error?: unknown
  isLoading: boolean
}

export function TweetPreview({ className, id, components }: TweetProps & { className?: string }) {
  const { data, error, isLoading }: ExtendedTweet = useTweet(id)

  if (data?.tombstone) {
    return <TweetTombstone text={data.tombstone.text.text} />
  }

  if (isLoading) return <TweetSkeleton />

  if (error || !data) return <TweetTombstone text='Unable to load this post' />

  return <CustomTweet className={className} tweet={data} components={components} />
}
