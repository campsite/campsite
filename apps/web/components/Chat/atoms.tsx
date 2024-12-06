import { atom } from 'jotai'

import { Attachment, Message } from '@campsite/types'

export const inReplyToAtom = atom<Message | null>(null)
export const attachmentsAtom = atom<Attachment[]>([])
export const editModeAtom = atom<Message | null>(null)
export const chatThreadPlacementAtom = atom<'hovercard' | undefined>(undefined)
export const shouldMinimizeComposerActionsAtom = atom<boolean>(false)

export const addAttachmentAtom = atom(null, (_get, set, attachment: Attachment) => {
  set(attachmentsAtom, (prev) => [...prev, attachment])
})

export const updateAttachmentAtom = atom(
  null,
  (_get, set, { optimisticId, value }: { optimisticId: string; value: Partial<Attachment> }) => {
    set(attachmentsAtom, (prev) => {
      const index = prev.findIndex((attachment) => attachment.optimistic_id === optimisticId)

      if (index === -1) return prev
      const oldAttachment = prev[index]

      return [...prev.slice(0, index), { ...oldAttachment, ...value }, ...prev.slice(index + 1)]
    })
  }
)

export const removeAttachmentAtom = atom(null, (_get, set, optimisticId: string) => {
  set(attachmentsAtom, (prev) => prev.filter((attachment) => attachment.optimistic_id !== optimisticId))
})

export const clearRepliesAtom = atom(null, (_get, set) => {
  set(inReplyToAtom, null)
  set(editModeAtom, null)
  set(attachmentsAtom, [])
})
