import { useMemo } from 'react'
import Router, { useRouter } from 'next/router'

import { Attachment, Note } from '@campsite/types'

import { useGetAttachment } from '@/hooks/useGetAttachment'
import { useGetComment } from '@/hooks/useGetComment'
import { useGetNote } from '@/hooks/useGetNote'

import { AttachmentLightbox, filterLightboxableAttachments } from '.'

export function NoteCommentAttachmentLightbox() {
  const router = useRouter()
  const noteId = router.query?.noteId as string
  const attachmentId = router.query?.ca as string

  const { data: note } = useGetNote({ id: noteId, enabled: !!noteId })
  const { data: attachment } = useGetAttachment(attachmentId)

  if (!note || !attachment || !attachment.subject_id) return null

  return <InnerCommentAttachmentLightbox note={note} attachment={attachment} commentId={attachment.subject_id} />
}

interface Props {
  note: Note
  attachment: Attachment
  commentId: string
}

function InnerCommentAttachmentLightbox({ note, attachment, commentId }: Props) {
  const router = useRouter()

  const { data: comment } = useGetComment(commentId)
  const attachments = useMemo(() => filterLightboxableAttachments(comment?.attachments ?? []), [comment])

  return (
    <AttachmentLightbox
      portalContainer='lightbox-portal'
      subject={note}
      selectedAttachmentId={attachment.id}
      attachments={attachments}
      onClose={() => {
        if (router.pathname === '/[org]/notes/[noteId]') {
          // eslint-disable-next-line unused-imports/no-unused-vars
          const { a, ca, ...rest } = Router.query

          Router.replace({ query: rest }, undefined, { scroll: false })
        } else {
          const query = { ...router.query }

          delete query.maskedQuery
          delete query.masked

          Router.replace({ pathname: router.pathname, query }, undefined, { scroll: false })
        }
      }}
      onSelectAttachment={(attachment) => {
        // pluck stateful values when changing attachments to clear open comments, etc
        // don't remove 'a' query param in case we're modaling on top of a post attachment lightbox
        // eslint-disable-next-line unused-imports/no-unused-vars
        const { ca, t, ...rest } = Router.query

        Router.replace({ query: { ...rest, ca: attachment.id } }, undefined, { scroll: false })
      }}
    />
  )
}
