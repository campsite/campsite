import { AnimatePresence, m } from 'framer-motion'
import { useAtom, useAtomValue } from 'jotai'
import { useDropzone } from 'react-dropzone'

import {
  Button,
  ChevronRightIcon,
  FaceSmilePlusIcon,
  GifIcon,
  PicturePlusIcon,
  PlusIcon,
  useBreakpoint
} from '@campsite/ui'

import { GifPicker } from '@/components/Gifs/GifPicker'
import { ADD_ATTACHMENT_SHORTCUT, ComposerEditorRef } from '@/components/Thread/utils'

import { chatThreadPlacementAtom, editModeAtom, shouldMinimizeComposerActionsAtom } from '../Chat/atoms'
import { ReactionPicker } from '../Reactions/ReactionPicker'

interface ComposerActionsProps {
  editorRef: React.RefObject<ComposerEditorRef>
  onUpload: (files: File[]) => void
  dropzone: ReturnType<typeof useDropzone>
}

export function ComposerActions({ editorRef, onUpload, dropzone }: ComposerActionsProps) {
  const threadPlacement = useAtomValue(chatThreadPlacementAtom)
  const [editMode, setEditMode] = useAtom(editModeAtom)
  const [shouldMinimizeComposerActions, setShouldMinimizeComposerActions] = useAtom(shouldMinimizeComposerActionsAtom)
  const isLg = useBreakpoint('lg')

  if (threadPlacement === 'hovercard') return null

  return (
    <div className='min-w-8.5 h-8.5 lg:pb-13 relative mb-0.5'>
      <AnimatePresence mode='sync' initial={false}>
        {editMode ? (
          <m.div
            className='h-8.5 w-8.5 absolute right-0 top-0 z-50 flex items-center justify-center'
            transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
            key='cancel'
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'fit-content', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
          >
            <Button
              round
              variant='plain'
              type='button'
              onClick={() => setEditMode(null)}
              iconOnly={<PlusIcon size={24} strokeWidth='1.5' className='rotate-45' />}
              accessibilityLabel='Cancel edit'
              className='h-8.5 w-8.5'
              tooltip='Cancel edit'
              tooltipShortcut='Esc'
            />
          </m.div>
        ) : !isLg && shouldMinimizeComposerActions ? (
          <m.div
            className='h-8.5 w-8.5 absolute right-0 top-0 z-50 flex items-center justify-center'
            transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
            key='show'
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'fit-content', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
          >
            <Button
              onClick={() => setShouldMinimizeComposerActions(false)}
              onMouseDown={(e) => e.preventDefault()}
              round
              variant='plain'
              type='button'
              iconOnly={<ChevronRightIcon size={24} />}
              className='h-8.5 w-8.5'
              accessibilityLabel='Show composer actions'
            />
          </m.div>
        ) : (
          <m.div
            className='min-w-8.5 flex'
            key='actions'
            transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
            initial={{ width: 0, opacity: 0, translateX: -32 }}
            animate={{ width: 'fit-content', opacity: 1, translateX: 0 }}
            exit={{ width: 0, opacity: 0, translateX: -32 }}
          >
            <Button
              round
              variant='plain'
              type='button'
              onClick={dropzone.open}
              onMouseDown={(e) => e.preventDefault()}
              iconOnly={<PicturePlusIcon size={24} strokeWidth='2' />}
              accessibilityLabel='Add files'
              className='h-8.5 w-8.5'
              tooltip='Add files'
              tooltipShortcut={ADD_ATTACHMENT_SHORTCUT}
            />
            <ReactionPicker
              custom
              trigger={
                <Button
                  round
                  variant='plain'
                  type='button'
                  iconOnly={<FaceSmilePlusIcon size={24} strokeWidth='2' />}
                  accessibilityLabel='Add emoji'
                  className='h-8.5 w-8.5'
                  tooltip='Add emoji'
                  tooltipShortcut=':'
                  onMouseDown={(e) => e.preventDefault()}
                />
              }
              onReactionSelect={(emoji) => editorRef.current?.editor()?.commands.insertReaction(emoji)}
              onClose={() => editorRef.current?.editor()?.commands.focus()}
            />
            <GifPicker
              trigger={
                <Button
                  round
                  variant='plain'
                  type='button'
                  iconOnly={<GifIcon size={24} />}
                  accessibilityLabel='Add GIF'
                  tooltip='Add GIF'
                  className='h-8.5 w-8.5'
                  onMouseDown={(e) => e.preventDefault()}
                />
              }
              onGifSelect={(gif) => onUpload([gif])}
              onClose={() => editorRef.current?.editor()?.commands.focus()}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
