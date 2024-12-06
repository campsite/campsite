import { useState } from 'react'
import { m } from 'framer-motion'
import { ScopeProvider } from 'jotai-scope'
import { isMacOs } from 'react-device-detect'

import { Attachment, Message, Note, Post } from '@campsite/types'
import { Button, ChatBubbleIcon, CloseIcon } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'
import { useIsDesktopApp } from '@campsite/ui/src/hooks'
import { cn } from '@campsite/ui/src/utils'

import { useGetAttachment } from '@/hooks/useGetAttachment'

import { hoveredCanvasCommentAtom } from '../CanvasComments/CanvasComment'
import { displayCanvasCommentsAtom, newCommentCoordinatesAtom } from '../CanvasComments/CanvasComments'
import { zoomAtom } from '../ZoomPane/atom'
import { FigmaTip } from './FigmaTip'
import { FigmaToggleButton } from './FigmaToggleButton'
import { FileMenu } from './FileDropdown'
import { Gallery } from './Gallery'
import { LightboxAttachmentRenderer } from './LightboxAttachmentRenderer'
import { NoteLightboxComments } from './NoteAttachmentLightboxComments'
import { ToggleCommentsButton } from './ToggleCommentsButton'
import { ZoomSelect } from './ZoomSelect'

export const filterLightboxableAttachments = (attachments: Attachment[], galleryId?: string) =>
  attachments.filter((a) => {
    if (a.principle || a.origami || a.stitch) return false

    if (galleryId && a.gallery_id !== galleryId) return false

    return true
  })

interface Props {
  subject?: Post | Message | Note
  selectedAttachmentId?: string
  attachments?: Attachment[]
  viewOnly?: boolean
  onClose: () => void
  onSelectAttachment: (attachment: Attachment) => void
  portalContainer?: string
}

/**
 * This is the main component for attachment lightboxes. It is used for:
 * - Post attachments
 * - Post comment attachments
 * - Note attachments
 * - Note comment attachments
 * - Message attachments
 */
export function AttachmentLightbox(props: Props) {
  const { selectedAttachmentId, onClose, portalContainer = undefined, attachments, onSelectAttachment } = props
  const open = !!selectedAttachmentId

  function nextAttachment(direction: 'next' | 'previous') {
    if (!attachments) return

    const iteration = direction === 'next' ? 1 : -1
    const index = attachments.findIndex((a) => a.id === selectedAttachmentId)
    const next = attachments.at((index + iteration + attachments.length) % attachments.length)

    if (!next) return

    onSelectAttachment(next)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      size='cover'
      portalContainer={portalContainer}
      onPointerDownOutside={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
      onInteractOutside={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
      onKeyDown={(e) => {
        // prevent on inputs, textareas, and contenteditable divs
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return
        // if the target is a div and content editable
        if ((e.target as HTMLElement).tagName === 'DIV' && (e.target as HTMLElement).isContentEditable) return

        if (e.key === 'ArrowRight') {
          nextAttachment('next')
        } else if (e.key === 'ArrowLeft') {
          nextAttachment('previous')
        }
      }}
      visuallyHiddenTitle='Attachment details'
      disableDescribedBy
    >
      {selectedAttachmentId && <InnerAttachmentLightbox {...props} selectedAttachmentId={selectedAttachmentId} />}
    </Dialog.Root>
  )
}

function isPost(subject: Post | Message | Note | undefined): subject is Post {
  return !!subject && 'poll' in subject && 'feedback_requests' in subject
}

function isNote(subject: Post | Message | Note | undefined): subject is Note {
  return !!subject && 'project_permission' in subject
}

function InnerAttachmentLightbox({
  subject,
  selectedAttachmentId,
  attachments,
  viewOnly = false,
  onClose,
  onSelectAttachment
}: Props) {
  const { data: attachment } = useGetAttachment(selectedAttachmentId)
  const isDesktopApp = useIsDesktopApp()
  const hasComments = subject && 'comments_count' in subject && !!subject.comments_count
  // for notes, open the sidebar by default if we're looking at an attachment
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!attachment) return null

  const canCanvas = attachment.image
  const isPostAttachment = attachment.subject_type === 'Post' && attachment.subject_id === subject?.id

  return (
    <ScopeProvider atoms={[zoomAtom, hoveredCanvasCommentAtom, displayCanvasCommentsAtom, newCommentCoordinatesAtom]}>
      <m.header
        className={cn('drag flex h-14 flex-row items-center justify-between border-b pl-4 pr-3 text-sm', {
          'pl-22': isDesktopApp && isMacOs
        })}
      >
        <div className='flex items-center gap-1'>
          <Button variant='plain' iconOnly={<CloseIcon />} accessibilityLabel='Close' onClick={onClose} />
          <FileMenu type='dropdown' attachment={attachment} links={isPost(subject) ? subject.links : []} />
          {canCanvas && <ZoomSelect />}
          {!viewOnly && hasComments && canCanvas && <ToggleCommentsButton />}
          <FigmaToggleButton attachment={attachment} />
        </div>
        <div className='flex items-center gap-1'>
          {!viewOnly && isNote(subject) && (
            <Button
              className='max-lg:hidden'
              variant='plain'
              onClick={() => setSidebarOpen((prev) => !prev)}
              leftSlot={<ChatBubbleIcon />}
              tooltip={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              accessibilityLabel={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              {hasComments ? `${subject.comments_count}` : 'Comments'}
            </Button>
          )}
        </div>
      </m.header>
      <div className='flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden'>
        <div className='flex flex-1 flex-col overflow-hidden'>
          <div className='bg-tertiary dark:bg-secondary relative flex h-auto flex-1 overflow-hidden'>
            <LightboxAttachmentRenderer
              key={attachment.id}
              attachment={attachment}
              preventNewComment={viewOnly || !isPostAttachment}
            />
            <FigmaTip attachment={attachment} />
          </div>
          {attachments && attachments.length > 1 && (
            <Gallery
              selectedAttachmentId={selectedAttachmentId}
              attachments={attachments}
              onSelectAttachment={(attachment) => {
                if (attachment.id === selectedAttachmentId) return
                onSelectAttachment(attachment)
              }}
            />
          )}
        </div>
        {!viewOnly && isNote(subject) && (
          <NoteLightboxComments
            note={subject}
            attachment={attachment}
            isOpen={sidebarOpen}
            onOpenChange={setSidebarOpen}
          />
        )}
      </div>
    </ScopeProvider>
  )
}
