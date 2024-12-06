import { useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import QRCode from 'react-qr-code'

import { Attachment } from '@campsite/types'
import {
  ALL_CONTAINER_STYLES,
  ANIMATION_CONSTANTS,
  Button,
  DownloadIcon,
  ExternalLinkIcon,
  Link,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  QRCodeIcon,
  UIText
} from '@campsite/ui'

import { getFileMetadata } from '@/utils/getFileMetadata'

import { FileTypeIcon } from '../FileTypeIcon'

export function FileAttachment({
  attachment,
  showActions = true,
  extraActions
}: {
  attachment: Pick<Attachment, 'name' | 'file_type' | 'download_url' | 'origami' | 'principle' | 'stitch'>
  showActions?: boolean
  extraActions?: React.ReactNode
}) {
  const metadata = getFileMetadata(attachment)

  const { name, downloadUrl, openUrl, qrCode } = metadata

  return (
    <div className='relative flex flex-1 items-center gap-2 px-3 py-2'>
      {downloadUrl && <Link href={downloadUrl} className='peer absolute inset-0 block' />}

      <div className='peer-hover:opacity-70'>
        <FileTypeIcon {...metadata} />
      </div>

      <div className='pointer-events-none relative line-clamp-1 flex-1 break-all peer-hover:opacity-70'>
        <UIText size='text-[13px]' tertiary className='font-mono'>
          {name}
        </UIText>
      </div>

      {showActions && (
        <div className='text-tertiary flex flex-row items-center justify-end gap-0.5'>
          {qrCode && <QRCodePopover attachment={attachment} />}
          {downloadUrl && (
            <Button
              href={downloadUrl}
              download={attachment.name || 'file'}
              iconOnly={<DownloadIcon />}
              variant='plain'
              accessibilityLabel='Download'
            />
          )}
          {openUrl && (
            <Button
              variant='plain'
              externalLink
              accessibilityLabel='Open file'
              iconOnly={<ExternalLinkIcon />}
              href={openUrl}
            />
          )}
          {extraActions}
        </div>
      )}

      {/* match button height so file attachment doesn't shift height when actions are displayed */}
      {!showActions && <div className='h-7.5 flex min-h-[30px] w-px flex-none' />}
    </div>
  )
}

function QRCodePopover({ attachment }: { attachment: Pick<Attachment, 'download_url'> }) {
  const [open, setOpen] = useState(false)
  const { openUrl } = getFileMetadata(attachment)

  if (!openUrl) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button iconOnly={<QRCodeIcon size={20} />} variant='plain' accessibilityLabel='View QR code' />
      </PopoverTrigger>
      <AnimatePresence>
        {open && (
          <PopoverPortal>
            <PopoverContent
              // z-index otherwise the popover could appear underneath other content in a note (like a subsequent attachment)
              className='z-10'
              asChild
              forceMount
              side='bottom'
              align='center'
              sideOffset={4}
            >
              <m.div {...ANIMATION_CONSTANTS} className={ALL_CONTAINER_STYLES}>
                <div className='relative flex flex-none p-3'>
                  <QRCode size={200} value={openUrl ?? ''} />
                </div>
              </m.div>
            </PopoverContent>
          </PopoverPortal>
        )}
      </AnimatePresence>
    </Popover>
  )
}
