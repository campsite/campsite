import { useRef, useState } from 'react'
import Image from 'next/image'

import { Link, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { useGetOpenGraphLink } from '@/hooks/useGetOpenGraphLink'

interface OpenGraphCardProps {
  className?: string
  url: string
  onForceRemove?: () => void
}

export function OpenGraphCard({ className, url, onForceRemove }: OpenGraphCardProps) {
  const [ogImageIsBroken, setOgImageIsBroken] = useState(false)

  const { data, isLoading } = useGetOpenGraphLink(url)

  const host = new URL(url).host.replace('www.', '')
  const faviconFallback = (!data?.image_url && !!data?.favicon_url) || ogImageIsBroken
  const [faviconError, setFaviconError] = useState(false)

  const shouldForceRemove = !isLoading && !data?.title && !data?.image_url
  const shouldForceRemoveRef = useRef(false)

  if (shouldForceRemove && !shouldForceRemoveRef.current) {
    shouldForceRemoveRef.current = true
    onForceRemove?.()
  }

  if (isLoading) return null
  if (!data || (data && !data.title && !data.image_url)) return null

  return (
    <Link
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'border-primary-opaque not-prose flex flex-1 overflow-hidden rounded-lg border transition-all active:scale-[0.99]',
        className
      )}
    >
      <div
        className={cn('flex-1', {
          'grid grid-rows-[minmax(0,1fr)_auto]': !faviconFallback,
          'flex flex-row items-center gap-6 px-3 py-2.5 pr-5': faviconFallback
        })}
      >
        {!faviconFallback && data?.image_url && !ogImageIsBroken && (
          <div
            className={cn('row-span-1 flex aspect-[2/1] border-b', {
              'bg-secondary': !data?.image_url
            })}
          >
            {data?.image_url && !ogImageIsBroken && (
              <Image
                src={data.image_url}
                alt={''}
                className='flex h-full w-full object-cover object-center'
                width={600}
                height={300}
                onError={() => setOgImageIsBroken(true)}
              />
            )}
          </div>
        )}

        <div className={cn('row-span-1 flex flex-1 flex-col overflow-hidden', { 'px-3 py-2.5': !faviconFallback })}>
          <UIText className='truncate' tertiary size='text-sm'>
            {host}
          </UIText>
          {(isLoading || data) && (
            <UIText className='break-anywhere line-clamp-1 min-w-0 text-[15px] font-medium' primary>
              {isLoading ? 'Loading...' : data?.title}
            </UIText>
          )}
        </div>

        {faviconFallback && (
          <div className='h-5 w-5'>
            {data?.favicon_url && !faviconError && (
              <Image
                src={data?.favicon_url}
                alt={''}
                className='flex rounded-sm object-cover object-center'
                width={24}
                height={24}
                onError={() => setFaviconError(true)}
              />
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
