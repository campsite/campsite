import { useAtom, useAtomValue } from 'jotai'

import { Button } from '@campsite/ui/Button'
import { Dialog } from '@campsite/ui/Dialog'
import {
  MaximizeIcon,
  MinimizeIcon,
  MinusDownIcon,
  MinusIcon,
  PopInIcon,
  PopOutIcon,
  TrashIcon
} from '@campsite/ui/Icons'

import { usePostComposerPresentation } from '@/components/PostComposer/hooks/usePostComposerPresentation'
import {
  isPostComposerExpandedAtomFamily,
  PostComposerPresentation,
  postComposerStateAtom,
  PostComposerType
} from '@/components/PostComposer/utils'

interface PostComposerHeaderActionsProps {
  onDeleteDraft: () => void
}

export function PostComposerHeaderActions({ onDeleteDraft }: PostComposerHeaderActionsProps) {
  const { postComposerPresentation, setPostComposerPresentation } = usePostComposerPresentation()
  const [isPostComposerExpanded, toggleIsPostComposerExpanded] = useAtom(
    isPostComposerExpandedAtomFamily(postComposerPresentation)
  )
  const postComposerState = useAtomValue(postComposerStateAtom)

  return (
    <div className='ml-auto flex items-center gap-0.5'>
      {postComposerState?.type === PostComposerType.EditDraftPost && (
        <Button
          variant='plain'
          iconOnly={<TrashIcon />}
          accessibilityLabel='Delete draft'
          tooltip='Delete draft'
          onClick={onDeleteDraft}
        />
      )}

      <Button
        variant='plain'
        iconOnly={postComposerPresentation === PostComposerPresentation.Mole ? <PopOutIcon /> : <PopInIcon />}
        accessibilityLabel={postComposerPresentation === PostComposerPresentation.Mole ? 'Pop out' : 'Pop in'}
        tooltip={postComposerPresentation === PostComposerPresentation.Mole ? 'Pop out' : 'Pop in'}
        className='hidden sm:flex'
        onClick={() =>
          setPostComposerPresentation(
            postComposerPresentation === PostComposerPresentation.Mole
              ? PostComposerPresentation.Dialog
              : PostComposerPresentation.Mole
          )
        }
      />

      <Button
        variant='plain'
        iconOnly={
          postComposerPresentation === PostComposerPresentation.Dialog ? (
            !isPostComposerExpanded ? (
              <MaximizeIcon />
            ) : (
              <MinimizeIcon />
            )
          ) : postComposerPresentation === PostComposerPresentation.Mole ? (
            !isPostComposerExpanded ? (
              <MinusIcon />
            ) : (
              <MinusDownIcon />
            )
          ) : null
        }
        accessibilityLabel={!isPostComposerExpanded ? 'Expand' : 'Shrink'}
        tooltip={!isPostComposerExpanded ? 'Expand' : 'Shrink'}
        onClick={() => toggleIsPostComposerExpanded()}
        className='hidden sm:flex'
      />

      <Dialog.CloseButton className='relative right-0 top-0' />
    </div>
  )
}
