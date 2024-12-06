import { useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

import { Call } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { ContextMenu } from '@campsite/ui/ContextMenu'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { useCopyToClipboard } from '@campsite/ui/hooks'
import {
  CopyIcon,
  DotsHorizontal,
  LinkIcon,
  PaperAirplaneIcon,
  PinTackFilledIcon,
  PinTackIcon,
  StarFilledIcon,
  StarOutlineIcon,
  TrashIcon
} from '@campsite/ui/Icons'
import { buildMenuItems } from '@campsite/ui/Menu'

import { DeleteAllCallRecordingsDialog } from '@/components/Calls/DeleteAllCallRecordingsDialog'
import { CallShareDialog } from '@/components/CallSharePopover/CallShareDialog'
import { FollowUpCalendarDialog } from '@/components/FollowUp'
import { useCreateCallFavorite } from '@/hooks/useCreateCallFavorite'
import { useCreateCallPin } from '@/hooks/useCreateCallPin'
import { useDeleteCallFavorite } from '@/hooks/useDeleteCallFavorite'
import { useDeleteCallPin } from '@/hooks/useDeleteCallPin'
import { useFollowUpMenuBuilder } from '@/hooks/useFollowUpMenuBuilder'

interface CallOverflowMenuProps extends React.PropsWithChildren {
  type: 'dropdown' | 'context'
  call: Call
}

export function CallOverflowMenu({ children, type, call }: CallOverflowMenuProps) {
  const router = useRouter()
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false)
  const [shareDialogIsOpen, setShareDialogIsOpen] = useState(false)
  const [copy] = useCopyToClipboard()
  const createPin = useCreateCallPin()
  const removePin = useDeleteCallPin()
  const createFavorite = useCreateCallFavorite()
  const deleteFavorite = useDeleteCallFavorite()
  const isCallView = router.pathname === '/[org]/calls/[callId]'
  const { followUpMenuItem, calendarOpen, setCalendarOpen, createFollowUp } = useFollowUpMenuBuilder(call)

  const items = buildMenuItems([
    {
      type: 'item',
      leftSlot: call.viewer_has_favorited ? <StarFilledIcon className='text-yellow-400' /> : <StarOutlineIcon />,
      label: call.viewer_has_favorited ? 'Unfavorite' : 'Favorite',
      onSelect: () => {
        if (call.viewer_has_favorited) {
          deleteFavorite.mutate(call.id)
        } else {
          createFavorite.mutate(call)
        }
      }
    },
    followUpMenuItem,

    call.project && { type: 'separator' },
    call.project && {
      type: 'item',
      leftSlot: call.project_pin_id ? <PinTackFilledIcon className='text-brand-primary' /> : <PinTackIcon />,
      label: call.project_pin_id ? 'Unpin from channel' : 'Pin to channel',
      onSelect: () => {
        if (!call.project) return
        if (call.project_pin_id) {
          removePin.mutate({ projectId: call.project.id, pinId: call.project_pin_id, callId: call.id })
        } else {
          createPin.mutate({ projectId: call.project.id, callId: call.id })
        }
      }
    },

    { type: 'separator' },
    {
      type: 'item',
      leftSlot: <PaperAirplaneIcon />,
      label: 'Share',
      onSelect: () => setShareDialogIsOpen(true)
    },
    {
      type: 'item',
      leftSlot: <LinkIcon />,
      label: 'Copy link',
      kbd: isCallView ? 'mod+shift+c' : undefined,
      onSelect: () => {
        copy(call.url)
        toast('Copied to clipboard')
      }
    },
    {
      type: 'item',
      leftSlot: <CopyIcon />,
      label: 'Copy ID',
      onSelect: () => {
        copy(call.id)
        toast('Copied to clipboard')
      }
    },

    call.viewer_can_destroy_all_recordings && {
      type: 'separator'
    },
    call.viewer_can_destroy_all_recordings && {
      type: 'item',
      leftSlot: <TrashIcon />,
      label: `Delete`,
      destructive: true,
      onSelect: () => setDeleteDialogIsOpen(true)
    }
  ])

  return (
    <>
      {call.viewer_can_destroy_all_recordings && (
        <DeleteAllCallRecordingsDialog call={call} open={deleteDialogIsOpen} onOpenChange={setDeleteDialogIsOpen} />
      )}

      <CallShareDialog call={call} open={shareDialogIsOpen} onOpenChange={setShareDialogIsOpen} />
      <FollowUpCalendarDialog open={calendarOpen} onOpenChange={setCalendarOpen} onCreate={createFollowUp} />

      {type === 'context' ? (
        <ContextMenu asChild items={items}>
          {children}
        </ContextMenu>
      ) : (
        <DropdownMenu
          items={items}
          align='end'
          trigger={<Button variant='plain' iconOnly={<DotsHorizontal />} accessibilityLabel='Call options' />}
        />
      )}
    </>
  )
}
