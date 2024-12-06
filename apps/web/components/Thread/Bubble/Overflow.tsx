import { useCallback, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import toast from 'react-hot-toast'

import { Message, MessageThread, SyncCustomReaction } from '@campsite/types'
import {
  Button,
  CopyIcon,
  DotsHorizontal,
  FaceSmilePlusIcon,
  PencilIcon,
  PostPlusIcon,
  ReplyIcon,
  TrashIcon
} from '@campsite/ui'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { buildMenuItems } from '@campsite/ui/Menu'
import { useBreakpoint, useCopyToClipboard } from '@campsite/ui/src/hooks'
import { cn } from '@campsite/ui/src/utils'

import { chatThreadPlacementAtom, editModeAtom, inReplyToAtom } from '@/components/Chat/atoms'
import { PostComposerType, usePostComposer } from '@/components/PostComposer'
import { ReactionPicker } from '@/components/Reactions/ReactionPicker'
import {
  DEFAULT_REACTIONS,
  OverflowDefaultReactionButton
} from '@/components/Thread/Bubble/OverflowDefaultReactionMenu'
import { useFrequentlyUsedReactions } from '@/hooks/reactions/useFrequentlyUsedReactions'
import { useCanHover } from '@/hooks/useCanHover'
import { useCreateMessageReaction } from '@/hooks/useCreateMessageReaction'
import { useDeleteMessage } from '@/hooks/useDeleteMessage'
import { useDeleteReaction } from '@/hooks/useDeleteReaction'
import { findGroupedReaction, hasReacted, StandardReaction } from '@/utils/reactions'
import { stripHtml } from '@/utils/stripHtml'

import { DeleteAttachmentsDialog } from './DeleteAttachmentsDialog'

export interface OverflowProps {
  message: Message
  thread: MessageThread
  state: [boolean, (open: boolean) => void]
}

export function Overflow({ message, thread, state }: OverflowProps) {
  const [open, onOpenChange] = state
  const { showPostComposer } = usePostComposer()
  const createReaction = useCreateMessageReaction()
  const deleteReaction = useDeleteReaction()
  const threadPlacement = useAtomValue(chatThreadPlacementAtom)
  const deleteMessage = useDeleteMessage()
  const canHover = useCanHover()
  const setEditMode = useSetAtom(editModeAtom)
  const setInReplyTo = useSetAtom(inReplyToAtom)
  const [copy] = useCopyToClipboard()

  const [openAttachmentsDialog, setOpenAttachmentsDialog] = useState(false)
  const [openReactionsPicker, setOpenReactionsPicker] = useState(false)

  const isDesktop = useBreakpoint('lg')

  const { frequentlyUsedReactions } = useFrequentlyUsedReactions({ hideCustomReactions: false })
  const handleReactionSelect = useCallback(
    (reaction: StandardReaction | SyncCustomReaction) => {
      const groupedReaction = findGroupedReaction(message.grouped_reactions, reaction)

      if (groupedReaction?.viewer_reaction_id) {
        deleteReaction.mutate({
          id: groupedReaction.viewer_reaction_id,
          type: 'message',
          threadId: thread.id,
          messageId: message.id
        })
      } else {
        createReaction.mutate({ threadId: thread.id, messageId: message.id, reaction })
      }

      onOpenChange(false)
    },
    [createReaction, deleteReaction, message.grouped_reactions, message.id, onOpenChange, thread.id]
  )

  if (message.discarded_at) return null

  const dropdownItems = buildMenuItems([
    {
      type: 'item',
      leftSlot: <PostPlusIcon />,
      label: 'Start a post...',
      onSelect() {
        showPostComposer({ type: PostComposerType.DraftFromMessage, message })
      }
    },
    message.has_content && {
      type: 'item',
      leftSlot: <CopyIcon />,
      label: 'Copy text',
      onSelect() {
        copy(stripHtml(message.content))
        toast('Copied to clipboard')
      }
    },
    message.viewer_is_sender &&
      message.has_content && {
        type: 'item',
        leftSlot: <PencilIcon />,
        label: 'Edit',
        onSelect() {
          setEditMode(message)
        }
      },

    {
      type: 'item',
      leftSlot: <ReplyIcon />,
      label: 'Reply',
      onSelect() {
        setInReplyTo(message)
      }
    },
    message.viewer_is_sender && { type: 'separator' },
    message.viewer_is_sender &&
      message.attachments.length >= 1 && {
        type: 'item',
        leftSlot: <TrashIcon isAnimated />,
        destructive: true,
        label: 'Delete attachments...',
        onSelect() {
          setOpenAttachmentsDialog(true)
        }
      },
    message.viewer_can_delete && {
      type: 'item',
      leftSlot: <TrashIcon isAnimated />,
      destructive: true,
      label: 'Delete',
      onSelect() {
        deleteMessage.mutate({ threadId: thread.id, messageId: message.id })
      }
    }
  ])

  /* show 5 quick reactions, prioritizing frequent, then default, deduped */
  const quickReactions = Array.from(
    new Map(
      [...frequentlyUsedReactions, ...DEFAULT_REACTIONS].slice(0, 5).map((reaction) => [reaction.id, reaction])
    ).values()
  )

  return (
    <div
      className={cn('flex gap-0.5 opacity-0', {
        'flex-row-reverse': !message.viewer_is_sender,
        'group-focus-within/bubble:opacity-100 group-hover/bubble:opacity-100 [&:has(button[aria-expanded="true"])]:opacity-100':
          canHover,
        'opacity-100': !canHover && isDesktop,
        hidden: !canHover && !isDesktop
      })}
    >
      <DeleteAttachmentsDialog
        message={message}
        thread={thread}
        open={openAttachmentsDialog}
        setOpen={setOpenAttachmentsDialog}
      />

      <ReactionPicker
        custom
        open={openReactionsPicker}
        onOpenChange={setOpenReactionsPicker}
        trigger={null}
        onReactionSelect={handleReactionSelect}
      />

      {dropdownItems.length > 0 && !threadPlacement && (
        <DropdownMenu
          disabled={!!message.optimistic_id}
          header={
            !isDesktop && (
              <div className='mx-auto flex max-w-sm items-center justify-between gap-0.5 px-3 pb-3 pt-1'>
                {quickReactions.map((reaction) => (
                  <OverflowDefaultReactionButton
                    key={reaction.id}
                    reaction={reaction}
                    onReactionSelect={(reaction) => {
                      handleReactionSelect(reaction)
                      onOpenChange(false)
                    }}
                    hasReacted={hasReacted(message.grouped_reactions, reaction)}
                  />
                ))}

                <Button
                  round
                  className='bg-tertiary h-12 w-12'
                  size='large'
                  variant='plain'
                  iconOnly={<FaceSmilePlusIcon size={30} />}
                  accessibilityLabel='Add reaction'
                  onClick={() => {
                    onOpenChange(false)
                    setOpenReactionsPicker(true)
                  }}
                />
              </div>
            )
          }
          open={open}
          onOpenChange={onOpenChange}
          trigger={
            <Button
              iconOnly={<DotsHorizontal />}
              className='text-tertiary'
              variant='plain'
              size='sm'
              round
              accessibilityLabel='More'
            />
          }
          sideOffset={4}
          align={message.viewer_is_sender ? 'end' : 'start'}
          side='top'
          items={dropdownItems}
        />
      )}

      <Button
        round
        size='sm'
        variant='plain'
        className='text-tertiary'
        iconOnly={<ReplyIcon size={18} />}
        accessibilityLabel='Reply'
        onClick={() => setInReplyTo(message)}
        disabled={!!message.optimistic_id}
      />

      <ReactionPicker
        custom
        modal={false}
        trigger={
          <Button
            disabled={!!message.optimistic_id}
            round
            size='sm'
            variant='plain'
            className='text-tertiary'
            iconOnly={<FaceSmilePlusIcon size={20} />}
            accessibilityLabel='Add reaction'
          />
        }
        onReactionSelect={handleReactionSelect}
      />
    </div>
  )
}
