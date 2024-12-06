import { useMemo, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useRouter } from 'next/router'
import pluralize from 'pluralize'

import { RAILS_AUTH_URL } from '@campsite/config'
import type { PollOption as PollOptionType, Post } from '@campsite/types'
import { BoxCheckIcon, Button, CheckCircleIcon, EyeIcon, PencilIcon, TrashIcon, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { FacePile } from '@/components/FacePile'
import { useScope } from '@/contexts/scope'
import { useCreateInboundMembershipRequest } from '@/hooks/useCreateInboundMembershipRequest'
import { useCreatePollVote } from '@/hooks/useCreatePollVote'
import { useCreatePostView } from '@/hooks/useCreatePostView'
import { useDeletePoll } from '@/hooks/useDeletePoll'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetMembershipRequest } from '@/hooks/useGetMembershipRequest'
import { useGetPollOptionVoters } from '@/hooks/useGetPollOptionVoters'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { signinUrl } from '@/utils/queryClient'

interface ShowPollProps {
  post: Post
  onEdit?: () => void
  editable?: boolean
}

export function InlinePostPoll({ post, onEdit, editable = true }: ShowPollProps) {
  const { poll } = post
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [upsellDialogOpen, setUpsellDialogOpen] = useState(false)
  const [previewResults, setPreviewResults] = useState(false)
  const createPollVote = useCreatePollVote()
  const createPostView = useCreatePostView()

  if (!poll) return null

  function handleVote(option: PollOptionType) {
    if (!post.viewer_is_organization_member) {
      setUpsellDialogOpen(true)
      return
    }

    createPollVote.mutate({ postId: post.id, optionId: option.id })
    createPostView.mutate({ postId: post.id, read: true })
  }

  return (
    <>
      {post.viewer_is_author && (
        <DeletePollDialog post={post} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
      )}
      <UpsellDialog open={upsellDialogOpen} onOpenChange={setUpsellDialogOpen} />
      <AnimatePresence>
        <m.div
          className='flex flex-1 flex-col gap-2'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.1, ease: 'linear' }}
        >
          <div className='flex flex-col gap-2'>
            {poll.options.map((option) =>
              poll.viewer_voted || previewResults ? (
                <PollOption postId={post.id} option={option} key={option.id} />
              ) : (
                <Button variant='flat' onClick={() => handleVote(option)} key={option.id}>
                  {option.description}
                </Button>
              )
            )}
          </div>
          {editable && (poll.viewer_voted || post.viewer_is_author) && (
            <div className='flex items-center justify-between'>
              {poll.viewer_voted ? (
                <UIText tertiary>
                  {poll.votes_count} {pluralize('vote', poll.votes_count)}
                </UIText>
              ) : (
                <span></span>
              )}
              {post.viewer_is_author && (
                <div className='flex items-center justify-end gap-2'>
                  {!poll.viewer_voted && (
                    <Button
                      variant={previewResults ? 'flat' : 'plain'}
                      iconOnly={<EyeIcon />}
                      accessibilityLabel='Toggle result preview'
                      onClick={() => setPreviewResults(!previewResults)}
                    />
                  )}
                  {onEdit && (
                    <>
                      <Button
                        variant='plain'
                        iconOnly={<PencilIcon />}
                        accessibilityLabel='Edit poll'
                        onClick={onEdit}
                      />
                      <Button
                        variant='plain'
                        iconOnly={<TrashIcon />}
                        accessibilityLabel='Delete poll'
                        onClick={() => setDeleteDialogOpen(true)}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </m.div>
      </AnimatePresence>
    </>
  )
}

interface PollOptionProps {
  postId: string
  option: PollOptionType
}

function PollOption({ postId, option }: PollOptionProps) {
  const getPollOptionVoters = useGetPollOptionVoters({
    postId,
    pollOptionId: option.id,
    enabled: option.votes_count > 0
  })
  const voters = useMemo(() => flattenInfiniteData(getPollOptionVoters.data), [getPollOptionVoters.data])

  return (
    <div className='relative flex min-h-[30px] items-center rounded-md py-1' key={option.id}>
      <div
        className='bg-quaternary absolute z-0 h-full rounded-md'
        style={{
          minWidth: '6px',
          width: `${option.votes_percent}%`
        }}
      />
      <div className='relative z-10 flex flex-1 items-center space-x-2 px-3'>
        <UIText>{option.description}</UIText>
        {option.viewer_voted && (
          <span className='flex-none'>
            <CheckCircleIcon />
          </span>
        )}
      </div>
      <div className='relative z-10 flex items-center gap-2 pr-2'>
        <UIText tertiary>
          {option.votes_count > 0 ? `${option.votes_count} ${pluralize('vote', option.votes_count)} · ` : ''}{' '}
          {option.votes_percent}%
        </UIText>
        {voters && voters.length > 0 && (
          <FacePile users={voters.map((voter) => voter.user)} limit={4} totalUserCount={option.votes_count} size='xs' />
        )}
      </div>
    </div>
  )
}

interface DeletePollDialogProps {
  post: Post
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DeletePollDialog({ post, open, onOpenChange }: DeletePollDialogProps) {
  const { mutate: deletePoll } = useDeletePoll({ postId: post.id })

  function handleDelete() {
    deletePoll()
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='sm'>
      <Dialog.Header>
        <Dialog.Title>Delete poll</Dialog.Title>
        <Dialog.Description>Are you sure you want to delete this poll?</Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='destructive' onClick={handleDelete} autoFocus>
            Delete
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}

interface UpsellDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function UpsellDialog({ open, onOpenChange }: UpsellDialogProps) {
  const { scope } = useScope()
  const { asPath } = useRouter()
  const { data: currentUser } = useGetCurrentUser()
  const createMembershipRequest = useCreateInboundMembershipRequest()
  const { data: membershipRequest } = useGetMembershipRequest({ enabled: open && !!currentUser?.logged_in })

  const handleJoinRequest = () => {
    if (scope) {
      createMembershipRequest.mutate({ slug: `${scope}` })
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      size='xl'
      visuallyHiddenTitle='Join this organization'
      visuallyHiddenDescription='Members of this organization can vote on this poll.'
    >
      <Dialog.Content>
        <div className='flex flex-col items-center justify-center gap-3 py-8 text-center'>
          <BoxCheckIcon size={32} />
          {currentUser?.logged_in ? (
            <>
              <div className='flex max-w-[80%] flex-col gap-1'>
                <UIText weight='font-medium'>Join this organization</UIText>
                <UIText tertiary>Members of this organization can vote on this poll.</UIText>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  onClick={handleJoinRequest}
                  variant='primary'
                  disabled={createMembershipRequest.isPending || membershipRequest?.requested}
                >
                  {membershipRequest?.requested ? 'Requested' : 'Request to join'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className='flex max-w-[80%] flex-col gap-1'>
                <UIText weight='font-medium'>Sign up or log in</UIText>
                <UIText tertiary>Members of this organization can vote on this poll.</UIText>
              </div>
              <div className='flex items-center gap-2'>
                <Button href={signinUrl({ from: asPath })} variant='flat'>
                  Log in
                </Button>
                <Button href={`${RAILS_AUTH_URL}/sign-up`} variant='brand'>
                  Sign up
                </Button>
              </div>
            </>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
