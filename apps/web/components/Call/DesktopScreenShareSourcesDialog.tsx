import { useEffect, useState } from 'react'
import { app } from '@todesktop/client-core'
import { CaptureSource } from '@todesktop/client-core/app'
import Image from 'next/image'

import { Button, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

interface Props {
  open: boolean
  onOpenChanged: (open: boolean) => void
  onSelectSource: (source: CaptureSource) => void
}

export function DesktopScreenShareSourcesDialog({ open, onOpenChanged, onSelectSource }: Props) {
  const [sources, setSources] = useState<CaptureSource[]>([])

  useEffect(() => {
    if (open) {
      app
        .getCaptureSources({
          types: ['window', 'screen'],
          thumbnailSize: {
            height: 300,
            width: 400
          }
        })
        .then((sources) => {
          setSources(sources.sort((a, b) => a.id.localeCompare(b.id)))
        })
    } else {
      setSources([])
    }
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChanged} size='xl' disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>Select a screen to share</Dialog.Title>
      </Dialog.Header>
      <Dialog.Content className='grid max-h-[300px] grid-cols-2 items-start gap-2'>
        {sources.map((source) => (
          <button
            key={source.id}
            className='h-38 hover:bg-tertiary flex flex-col items-center justify-center gap-2 rounded object-contain px-2 py-4'
            onClick={() => onSelectSource(source)}
          >
            <Image
              src={source.thumbnail}
              alt=''
              width={200}
              height={150}
              className='flex flex-1 overflow-hidden rounded object-contain'
            />
            <UIText className='line-clamp-1 max-w-full text-center'>{source.name}</UIText>
          </button>
        ))}
      </Dialog.Content>
      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChanged(false)}>
            Cancel
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
