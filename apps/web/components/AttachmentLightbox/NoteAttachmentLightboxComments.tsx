import { m } from 'framer-motion'

import { Attachment, Note } from '@campsite/types'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'
import { cn } from '@campsite/ui/src/utils'

import { useViewportWidth } from '@/hooks/useViewportWidth'

import { NoteAttachmentComments } from '../NoteComments'

interface Props {
  note: Note
  attachment: Attachment
  isOpen: boolean
  onOpenChange(open: boolean): void
}

export function NoteLightboxComments({ note, attachment, isOpen, onOpenChange }: Props) {
  const viewportWidth = useViewportWidth()
  const isLargeViewport = viewportWidth >= 1024
  const isExtraLargeViewport = viewportWidth >= 1920
  const width = isExtraLargeViewport ? '500px' : isLargeViewport ? '400px' : '100%'

  return (
    <>
      <LayeredHotkeys keys='mod+.' callback={() => onOpenChange(!isOpen)} options={{ enableOnContentEditable: true }} />

      <OuterContainer isOpen={isOpen || !isLargeViewport} width={width}>
        <NoteAttachmentComments
          note={note}
          attachmentId={attachment?.id}
          onSidebarOpenChange={onOpenChange}
          hideAttachment
        />
      </OuterContainer>
    </>
  )
}

function OuterContainer({ children, isOpen, width }: { children: React.ReactNode; isOpen: boolean; width: string }) {
  return (
    <m.aside
      initial={false}
      animate={{ width: isOpen ? width : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      aria-disabled={!isOpen}
      className={cn(
        '4xl:max-w-[500px] flex flex-none flex-col border-t focus:outline-none focus:ring-0 lg:w-full lg:max-w-[400px] lg:border-l lg:border-t-0',
        {
          invisible: !isOpen
        }
      )}
    >
      <div className='4xl:min-w-[500px] flex flex-1 flex-col lg:max-h-full lg:min-w-[400px]'>{children}</div>
    </m.aside>
  )
}
