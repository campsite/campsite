import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { AnimatePresence, m } from 'framer-motion'

import { Note } from '@campsite/types/generated'
import { CheckCircleFilledIcon } from '@campsite/ui/Icons'
import { cn } from '@campsite/ui/utils'

import { PublishTab } from '@/components/NoteSharePopover/PublishTab'
import { ShareTab } from '@/components/NoteSharePopover/ShareTab'
import { PostComposerType, usePostComposer } from '@/components/PostComposer'

interface NoteShareContentProps {
  note: Note
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NoteShareContent({ note, open, onOpenChange }: NoteShareContentProps) {
  const [tab, setTab] = useState('share')
  const { showPostComposer } = usePostComposer()

  return (
    <Tabs.Root defaultValue='share' onValueChange={setTab}>
      {(note.viewer_can_edit || note.public_visibility) && (
        <Tabs.List className='flex overflow-hidden rounded-t-lg' aria-label='Manage your account'>
          <Tabs.Trigger
            className={cn(
              'flex flex-1 items-center justify-center border-b border-r p-3 text-center text-sm font-medium',
              {
                'text-primary border-b-transparent bg-transparent': tab === 'share',
                'text-tertiary hover:text-secondary bg-secondary border-b-primary': tab === 'publish'
              }
            )}
            value='share'
          >
            Share
          </Tabs.Trigger>
          <Tabs.Trigger
            className={cn('flex flex-1 items-center justify-center border-b p-3 text-center text-sm font-medium', {
              'text-primary border-b-transparent bg-transparent': tab === 'publish',
              'text-tertiary hover:text-secondary bg-secondary border-b-primary': tab === 'share'
            })}
            value='publish'
          >
            <span>Publish</span>
            <AnimatePresence initial={!note.public_visibility}>
              {note.public_visibility && (
                <m.div
                  initial={{
                    width: 0,
                    opacity: 0
                  }}
                  animate={{
                    width: 28,
                    opacity: 1
                  }}
                  exit={{
                    width: 0,
                    opacity: 0
                  }}
                  className='flex items-center justify-end'
                >
                  <CheckCircleFilledIcon className='text-blue-500' />
                </m.div>
              )}
            </AnimatePresence>
          </Tabs.Trigger>
        </Tabs.List>
      )}

      <ShareTab
        note={note}
        open={open}
        onOpenChange={onOpenChange}
        onCompose={() => showPostComposer({ type: PostComposerType.DraftFromNote, note })}
      />
      <PublishTab note={note} />
    </Tabs.Root>
  )
}
