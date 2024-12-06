import { animate, m, useMotionValue } from 'framer-motion'

import { ArrowRightIcon, Body, Button, TextField } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

export interface KeyboardShortcutProps {
  shortcut: string
}

export function KeyboardShortcut({ shortcut }: KeyboardShortcutProps) {
  const isWindows = /(win32|win64|windows|wince)/i.test(navigator.userAgent)

  return (
    <div className='flex items-center gap-1'>
      {shortcut.split('').map((key) => (
        <kbd
          key={key}
          className='text-primary bg-elevated inline-flex items-center justify-center rounded-[6px] border border-b-[3px] px-2.5 py-1.5 text-lg font-medium leading-none'
        >
          <span className='translate-y-[1px]'>
            {key === '⌘' ? isWindows ? 'ctrl' : <span className='flex scale-125'>⌘</span> : key}
          </span>
        </kbd>
      ))}
    </div>
  )
}

export interface FileUrlPromptProps {
  onSubmit(fileKey?: string): void
  open: boolean
  onOpenChange(open: boolean): void
}

export function FileUrlPrompt({ onSubmit, open, onOpenChange }: FileUrlPromptProps) {
  const x = useMotionValue(0)

  function shake() {
    animate(x, [-2, 2, -2, 2, -2, 2, 0], {
      duration: 0.5,
      ease: 'easeInOut'
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Header>
        <Dialog.Title>
          <Body element='span' weight='font-semibold' size='text-sm'>
            Add a link
          </Body>
        </Dialog.Title>
        <Dialog.Description>
          <Body element='span' tertiary size='text-sm'>
            Paste the file URL to link to your frames from Campsite.
          </Body>
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Content asChild>
        <div
          className='flex flex-col gap-4'
          onPasteCapture={(e) => {
            try {
              const url = new URL(e.clipboardData.getData('text/plain'))
              const match = /\/([\w-]+)\/(?<fileKey>[^\/]+)/.exec(url.pathname)

              if (url.hostname === 'www.figma.com' && match?.groups) {
                onSubmit(match.groups.fileKey)
              }
            } catch {
              // URL not pasted, let's skip
              e.preventDefault()
              shake()
            }
          }}
        >
          <div className='mb-1 flex items-center justify-center gap-2'>
            <KeyboardShortcut shortcut='⌘L' />

            <ArrowRightIcon className='text-quaternary' />

            <KeyboardShortcut shortcut='⌘V' />
          </div>

          <div className='flex flex-col gap-2'>
            <m.div style={{ x }}>
              <TextField
                readOnly
                placeholder='https://www.figma.com/file/abc123'
                onKeyDownCapture={(e) => {
                  if (!e) return

                  const isPaste = e.key === 'v' && (e.metaKey || e.ctrlKey)

                  if (!isPaste) {
                    e.preventDefault()
                  }
                }}
              />
            </m.div>

            <Button variant='plain' onClick={() => onSubmit()}>
              Skip
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
