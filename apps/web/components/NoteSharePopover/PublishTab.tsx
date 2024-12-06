import * as Tabs from '@radix-ui/react-tabs'
import { AnimatePresence, m } from 'framer-motion'

import { Note } from '@campsite/types'
import { Button, GlobeIcon, TextField, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { useUpdateNoteVisibility } from '@/hooks/useUpdateNoteVisibility'

export function PublishTab({ note }: { note: Note }) {
  const { mutate: updateVisibility } = useUpdateNoteVisibility()

  return (
    <Tabs.Content value='publish'>
      <div className='flex flex-col gap-4 p-5'>
        <div className='flex flex-col items-center justify-center'>
          <GlobeIcon
            size={40}
            className={cn('transition-all duration-300', {
              'text-quaternary': !note.public_visibility,
              'text-blue-500': note.public_visibility
            })}
          />

          <div className='my-4 flex flex-col items-center justify-center gap-0.5 text-center'>
            <UIText weight='font-semibold'>Publish to the web</UIText>
            <UIText secondary>Share your document to anyone with the link</UIText>
          </div>

          {note.viewer_can_edit && (
            <Button
              className='flex-none'
              fullWidth
              variant={note.public_visibility ? 'flat' : 'important'}
              onClick={() =>
                updateVisibility({ noteId: note.id, visibility: note.public_visibility ? 'default' : 'public' })
              }
            >
              {note.public_visibility ? 'Disable' : 'Publish'}
            </Button>
          )}

          {/* spacer */}
          {note.viewer_can_edit && (
            <AnimatePresence initial={!note.public_visibility}>
              {note.public_visibility && (
                <m.div
                  initial={{
                    height: 0
                  }}
                  animate={{
                    height: 20
                  }}
                  exit={{
                    height: 0
                  }}
                />
              )}
            </AnimatePresence>
          )}

          <AnimatePresence initial={!note.public_visibility}>
            {note.public_visibility && (
              <m.div
                initial={{
                  height: 0,
                  opacity: 0
                }}
                animate={{
                  height: 'auto',
                  opacity: 1
                }}
                exit={{
                  height: 0,
                  opacity: 0
                }}
                className='flex w-full flex-col text-center'
              >
                <TextField
                  helpText='Anyone with this link can read this doc.'
                  autoFocus={false}
                  value={note.public_share_url}
                  readOnly
                  clickToCopy
                  additionalClasses='w-full flex-1'
                />
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Tabs.Content>
  )
}
