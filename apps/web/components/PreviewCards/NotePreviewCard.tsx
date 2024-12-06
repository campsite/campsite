import { useState } from 'react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import pluralize from 'pluralize'

import { cn, EyeHideIcon, Link, UIText } from '@campsite/ui'

import { BreadcrumbLabel } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useGetNote } from '@/hooks/useGetNote'

import { NoteBreadcrumbIcon } from '../Titlebar/BreadcrumbPageIcons'

interface Props {
  className?: string
  noteId: string
  interactive?: boolean
}

export function NotePreviewCard({ className, noteId, interactive = true }: Props) {
  const { resolvedTheme } = useTheme()
  const { data: note, isError } = useGetNote({ id: noteId, enabled: true })
  const baseUrl = note?.description_thumbnail_base_url
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const urlsize = 700
  const url = `${baseUrl}/${urlsize}/${resolvedTheme}`

  // show tombstone to request permissions
  if (isError) {
    return (
      <div className='text-tertiary bg-secondary flex w-full flex-col items-start justify-center gap-3 rounded-lg border p-4 lg:flex-row lg:items-center'>
        <EyeHideIcon className='flex-none' size={24} />
        <UIText inherit>
          This document cannot be found — you may not have the proper permissions, it may have moved, or was deleted.
        </UIText>
      </div>
    )
  }

  if (!note) {
    return (
      <div
        className={cn(
          'bg-primary dark:bg-secondary relative min-h-24 w-full overflow-hidden rounded-lg border',
          className
        )}
      ></div>
    )
  }

  return (
    <div
      className={cn(
        'bg-elevated hover:bg-secondary hover:border-primary group/note relative flex w-full max-w-lg flex-1 overflow-clip rounded-lg border focus:outline-none focus:ring-0',
        className
      )}
    >
      {interactive && <Link href={note.url} className='absolute inset-0 z-0' />}

      <div className='not-prose grid h-full w-full grid-cols-3 gap-3'>
        <div className='col-span-2 flex w-full flex-1 flex-col gap-3 p-3 pr-6'>
          {note.project ? (
            <div className='flex flex-row flex-nowrap items-center gap-1.5'>
              <NoteBreadcrumbIcon />
              <BreadcrumbLabel>{note.project.name}</BreadcrumbLabel>
            </div>
          ) : (
            <NoteBreadcrumbIcon />
          )}

          <div className='flex flex-1 flex-col justify-end'>
            <UIText weight='font-medium' className='break-anywhere line-clamp-2 text-[15px] leading-snug'>
              {note.title || 'Untitled'}
            </UIText>
            {note.comments_count > 0 && (
              <UIText className='line-clamp-1 flex truncate' tertiary>
                {note.comments_count} {pluralize('comment', note.comments_count)}
              </UIText>
            )}
          </div>
        </div>

        <div className='pointer-events-none col-span-1 block h-[128px] w-full min-w-[128px] flex-none pb-0 pr-4 pt-3'>
          <div className='rounded-b-0 bg-elevated dark:bg-quaternary relative flex aspect-[3/4] h-full min-h-[128px] w-full flex-1 translate-y-1 flex-col rounded-t-lg border border-b-0 p-3 shadow-md transition-all duration-200 group-hover/note:-translate-y-0 group-hover/note:shadow-xl'>
            {showPlaceholder && (
              <div className='absolute inset-3 flex flex-col gap-2'>
                <div className='bg-tertiary h-1.5 w-[88%] rounded dark:bg-white/5' />
                <div className='bg-tertiary h-1.5 w-[80%] rounded dark:bg-white/5' />
                <div className='bg-tertiary h-1.5 w-[90%] rounded dark:bg-white/5' />
                <div className='bg-tertiary h-1.5 w-[84%] rounded dark:bg-white/5' />
                <div className='bg-tertiary h-1.5 w-[70%] rounded dark:bg-white/5' />
              </div>
            )}

            {!showPlaceholder && (
              <UIText
                size='text-[6.5px]'
                weight='font-bold'
                className='break-anywhere mb-1 line-clamp-3 min-w-0 flex-none leading-[1.14] tracking-tighter'
              >
                {note.title || 'Untitled'}
              </UIText>
            )}

            <Image
              alt={`Thumbnail for document ${note.title || 'Untitled'} by ${note.member.user.display_name || 'Unknown'}`}
              src={url}
              draggable='false'
              className={cn(
                'relative inline-block min-h-[128px] w-full max-w-full object-cover object-top transition-opacity',
                {
                  'opacity-0': showPlaceholder
                }
              )}
              width={urlsize / 2}
              height={urlsize / 2}
              onLoad={() => setShowPlaceholder(false)}
              onLoadStart={() => setShowPlaceholder(true)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
