import { useState } from 'react'
import Image from 'next/image'

import { Link, LoadingSpinner, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { useGetOpenGraphLink } from '@/hooks/useGetOpenGraphLink'

import { BookmarkFavicon } from './Projects/ProjectBookmarks/BookmarkIcon'

interface OpenGraphCardProps {
  className?: string
  url: string
}

export function SlimOpenGraphCard({ className, url }: OpenGraphCardProps) {
  const [ogImageIsBroken, setOgImageIsBroken] = useState(false)

  const { data, isLoading } = useGetOpenGraphLink(url)

  const host = new URL(url).host.replace('www.', '')
  const [faviconError, setFaviconError] = useState(false)

  if (isLoading) {
    return (
      <div
        className={cn(
          'bg-primary dark:bg-secondary relative flex min-h-12 w-full items-center overflow-hidden rounded-lg border pl-4',
          className
        )}
      >
        <LoadingSpinner />
      </div>
    )
  }

  const hasTitle = !!data?.title
  const showOGImage = data?.image_url && !ogImageIsBroken
  const showFavicon = !showOGImage && data?.favicon_url && !faviconError
  const showFallbackIcon = !showOGImage && !showFavicon

  return (
    <Link
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'border-primary-opaque not-prose flex min-h-12 flex-1 overflow-hidden rounded-lg border transition-all active:scale-[0.99]',
        className
      )}
    >
      <div className='flex min-w-0 flex-1 flex-col justify-center gap-1 truncate px-3 py-2.5 pr-5'>
        {hasTitle && (
          <UIText
            className='break-anywhere line-clamp-1 min-w-0 truncate text-[15px] font-medium leading-tight'
            primary
          >
            {data.title}
          </UIText>
        )}
        <UIText className='break-anywhere truncate' tertiary size='text-sm'>
          {hasTitle ? host : url}
        </UIText>
      </div>

      {showOGImage && (
        <div className='flex h-[70px] border-l'>
          <Image
            src={data.image_url ?? ''}
            alt={''}
            className='flex h-[70px] w-auto object-cover object-center'
            onError={() => setOgImageIsBroken(true)}
            width={200}
            height={100}
          />
        </div>
      )}
      {(showFavicon || showFallbackIcon) && (
        <div className='flex items-center justify-center py-3 pr-4'>
          {showFavicon ? (
            <Image
              src={data.favicon_url ?? ''}
              alt={''}
              className='flex rounded-sm object-cover object-center'
              width={24}
              height={24}
              onError={() => setFaviconError(true)}
            />
          ) : (
            <BookmarkFavicon url={url} title={host} />
          )}
        </div>
      )}
    </Link>
  )
}
