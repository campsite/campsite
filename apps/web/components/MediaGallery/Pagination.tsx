import { useRef, useState } from 'react'
import { Reorder } from 'framer-motion'
import Image from 'next/image'
import { DropzoneState } from 'react-dropzone'

import { MediaGalleryItemAttributes } from '@campsite/editor/extensions'
import { Button, ChevronLeftIcon, ChevronRightIcon, LoadingSpinner, PlusIcon, ThickCloseIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { useExecuteOnChange } from '@/hooks/useExecuteOnChange'
import { useServerOrOptimisticAttachment } from '@/hooks/useServerOrOptimisticAttachment'

function PaginationButton(props: { onClick: () => void; direction: 'previous' | 'next' }) {
  const { onClick, direction } = props

  return (
    <Button
      variant='plain'
      onClick={onClick}
      type='button'
      iconOnly={
        <span className={cn({ '-mr-px': direction === 'next', '-ml-px': direction === 'previous' })}>
          {direction === 'previous' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </span>
      }
      accessibilityLabel={direction === 'next' ? 'Next attachment' : 'Previous attachment'}
    />
  )
}

type PaginationItemProps = Pick<CarouselPaginationProps, 'activeIndex' | 'setActiveIndex'> & {
  index: number
  attachment: MediaGalleryItemAttributes
}

function PaginationItem(props: PaginationItemProps) {
  const { activeIndex, setActiveIndex, index } = props
  const { attachment } = useServerOrOptimisticAttachment(props.attachment)
  const imgSrc = attachment?.image_urls?.thumbnail_url || attachment?.optimistic_src
  const vidPreviewSrc = attachment?.preview_thumbnail_url
  const isUploading = attachment?.optimistic_src

  return (
    <>
      <button
        key={props.attachment.id}
        type='button'
        className={cn(
          'bg-tertiary relative h-9 w-9 flex-none cursor-[inherit] rounded ring-1 ring-black/5 after:absolute after:-bottom-[6px] after:left-1/2 after:h-[3px] after:w-4 after:-translate-x-1/2 after:rounded-full after:opacity-0 after:content-[""] dark:ring-white/5',
          {
            'after:bg-black after:opacity-100 dark:after:bg-white': activeIndex === index,
            'after:bg-black after:opacity-0 hover:after:opacity-50 dark:after:bg-white': activeIndex !== index,
            'opacity-40': isUploading
          }
        )}
        onClick={() => setActiveIndex([index, activeIndex > index ? -1 : 1])}
      >
        {attachment && (
          <>
            {attachment.video && vidPreviewSrc && (
              <Image
                key={attachment.id}
                width={56}
                height={56}
                src={vidPreviewSrc}
                alt='Uploaded video'
                className='aspect-square rounded object-cover object-top'
              />
            )}

            {attachment.gif && (
              <video
                key={attachment.id}
                controls={false}
                preload='metadata'
                className='object-top-center pointer-events-none h-full w-full rounded object-cover'
                draggable={false}
              >
                <source src={`${attachment.url}?fm=mp4#t=0.1`} type='video/mp4' />
                <source src={`${attachment.url}#t=0.1`} />
              </video>
            )}

            {attachment.image && imgSrc && (
              <Image
                width={56}
                height={56}
                src={imgSrc}
                alt=''
                className='aspect-square rounded object-cover object-top'
              />
            )}

            {attachment.origami && (
              <div className='bg-tertiary flex h-full w-full items-center justify-center rounded' key={attachment.id}>
                <Image src={'/img/origami.png'} width={20} height={20} alt='Origami attachment' />
              </div>
            )}

            {attachment.principle && (
              <div className='bg-tertiary flex h-full w-full items-center justify-center rounded' key={attachment.id}>
                <Image src={'/img/principle.png'} width={20} height={20} alt='Principle attachment' />
              </div>
            )}

            {attachment.stitch && (
              <div className='bg-tertiary flex h-full w-full items-center justify-center rounded' key={attachment.id}>
                <Image src={'/img/stitch.png'} width={20} height={20} alt='Stitch attachment' />
              </div>
            )}

            {attachment.lottie && (
              <div className='bg-tertiary flex h-full w-full items-center justify-center rounded' key={attachment.id}>
                <Image src={'/img/lottie.png'} width={20} height={20} alt='Lottie attachment' />
              </div>
            )}
          </>
        )}
      </button>
      {isUploading && (
        <div className='absolute inset-0 flex h-9 w-9 items-center justify-center'>
          <LoadingSpinner />
        </div>
      )}
    </>
  )
}

interface CarouselPaginationProps {
  attachments: MediaGalleryItemAttributes[]
  activeIndex: number
  setActiveIndex: ([index, direction]: [number, number]) => void
  paginate: (direction: number) => void
  onRemoveItem?: (id: string) => void
  onReorder?: (ids: string[]) => void
  dropzone?: DropzoneState
}

// Avoids leaking the updated sort order outside of the reordering UI until the user is done dragging
// so the attachment that corresponds to `activeIndex` doesn't change as you drag items.
function useLocalSortOrder(attachments: MediaGalleryItemAttributes[]) {
  const [sortedAttachments, setSortedAttachments] = useState(attachments)

  useExecuteOnChange(attachments, () => setSortedAttachments(attachments))

  function updateSortedAttachments(ids: string[]) {
    setSortedAttachments(
      ids.map((id) => attachments.find((a) => a.optimistic_id === id)).filter(Boolean) as MediaGalleryItemAttributes[]
    )
  }

  return [sortedAttachments, updateSortedAttachments] as const
}

function useScrollThumbnailIntoView(activeIndex: number, containerRef: React.RefObject<HTMLDivElement>) {
  useExecuteOnChange(activeIndex, () => {
    if (!containerRef.current) return

    const container = containerRef.current
    const activeItem = container.children[activeIndex]

    if (!activeItem) return

    const activeItemRect = activeItem.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    if (activeItemRect.left < containerRect.left || activeItemRect.right > containerRect.right) {
      // manually calculate `left` to avoid scroll jank
      const scrollLeft =
        container.scrollLeft +
        activeItemRect.left -
        containerRect.left -
        containerRect.width / 2 +
        activeItemRect.width / 2

      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  })
}

export function CarouselPagination(props: CarouselPaginationProps) {
  const { attachments, activeIndex, setActiveIndex, paginate, onRemoveItem, dropzone, onReorder } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<undefined | string>()
  const [sortedAttachments, setSortedAttachments] = useLocalSortOrder(attachments)

  useScrollThumbnailIntoView(activeIndex, containerRef)

  const displayAttachments = draggingId ? sortedAttachments : attachments

  return (
    <div className='mx-auto flex items-start justify-center pb-1.5 pt-1'>
      <div className='mt-2 flex h-9 flex-none place-items-center'>
        <PaginationButton direction='previous' onClick={() => paginate(-1)} />
      </div>
      <div className='scrollbar-hidden overflow-scroll px-2'>
        <Reorder.Group
          axis='x'
          as='div'
          values={displayAttachments.map((a) => a.optimistic_id)}
          onReorder={setSortedAttachments}
          className='flex items-start gap-2 py-2'
          ref={containerRef}
        >
          {displayAttachments.map((attachment, index) => {
            return (
              <Reorder.Item
                as='div'
                key={attachment.optimistic_id}
                value={attachment.optimistic_id}
                layout='position'
                drag={onReorder ? 'x' : false}
                dragConstraints={containerRef}
                dragElastic={0}
                onDragStart={() => {
                  setDraggingId(attachment.optimistic_id)
                }}
                onDragEnd={(e) => {
                  // prevent item selection when the mouse is released
                  e.preventDefault()
                  setDraggingId(undefined)
                  onReorder?.(displayAttachments.map((a) => a.optimistic_id))
                }}
                className={cn('relative h-9 flex-none', {
                  'cursor-grabbing opacity-60': draggingId === attachment.optimistic_id,
                  'pointer-events-none': !!draggingId,
                  'cursor-grab active:cursor-grabbing': !!onReorder && !draggingId,
                  'cursor-pointer': !onReorder
                })}
              >
                <PaginationItem
                  index={index}
                  attachment={attachment}
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                />
                {onRemoveItem && (
                  <button
                    type='button'
                    className='absolute right-0 top-0 -m-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-400'
                    aria-label='Remove item'
                    onClick={() => onRemoveItem(attachment.optimistic_id)}
                  >
                    <ThickCloseIcon className='h-3 w-3' />
                  </button>
                )}
              </Reorder.Item>
            )
          })}
        </Reorder.Group>
      </div>
      {dropzone && (
        <div className='py-2'>
          <div className='flex h-9 flex-none place-items-center'>
            <Button
              variant='plain'
              type='button'
              iconOnly={<PlusIcon className='h-4 w-4' />}
              accessibilityLabel='Add attachment'
              className={dropzone.isDragActive ? 'bg-secondary-action ring-2 ring-blue-500' : ''}
              onClick={() => dropzone.open()}
            />
          </div>
        </div>
      )}
      <div className='mt-2 flex h-9 flex-none place-items-center'>
        <PaginationButton direction='next' onClick={() => paginate(1)} />
      </div>
    </div>
  )
}
