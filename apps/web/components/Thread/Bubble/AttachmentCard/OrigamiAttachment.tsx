import Image from 'next/image'
import QRCode from 'react-qr-code'

import { Attachment } from '@campsite/types'
import { Button, DownloadIcon, ExternalLinkIcon } from '@campsite/ui'

interface Props {
  attachment: Attachment
  preview?: boolean
}

export function OrigamiAttachment({ attachment, preview }: Props) {
  return (
    <div className='relative flex h-full w-full flex-col items-center justify-center gap-8 p-8 max-lg:min-h-[256px]'>
      <div className='relative flex flex-none'>
        <QRCode
          size={attachment.is_subject_comment ? 96 : 128}
          value={attachment.download_url.replace('https', 'origami-public')}
        />
        {!preview && (
          <Image
            src={'/img/origami.png'}
            width={32}
            height={32}
            alt='Origami logo'
            className='absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full ring-4 ring-white dark:ring-black'
          />
        )}
      </div>

      {!preview && (
        <div className='flex gap-2'>
          <Button href={attachment.download_url} download={attachment.name || 'file'} leftSlot={<DownloadIcon />}>
            Download
          </Button>
          <Button leftSlot={<ExternalLinkIcon />} href={attachment.download_url.replace('https', 'origami-public')}>
            Open
          </Button>
        </div>
      )}
    </div>
  )
}
