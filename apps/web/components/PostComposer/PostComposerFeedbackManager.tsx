import { useMemo, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { v4 as uuid } from 'uuid'

import { OrganizationMember } from '@campsite/types'
import {
  Avatar,
  ButtonPlusIcon,
  CheckCircleFilledIcon,
  CircleFilledCloseIcon,
  LinearBacklogIcon,
  SelectPopover,
  UIText
} from '@campsite/ui'

import { GuestBadge } from '@/components/GuestBadge'
import { MemberAvatar } from '@/components/MemberAvatar'
import { useCreateProjectMembership } from '@/hooks/useCreateProjectMembership'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetProject } from '@/hooks/useGetProject'
import { useGetProjectMembers } from '@/hooks/useGetProjectMembers'
import { useSyncedMembers } from '@/hooks/useSyncedMembers'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

import { PostSchema } from '../Post/schema'

interface PostComposerFeedbackManagerProps {
  form: UseFormReturn<PostSchema>
}

export function PostComposerFeedbackManager({ form }: PostComposerFeedbackManagerProps) {
  const [open, setOpen] = useState(false)
  const { data: currentUser } = useGetCurrentUser()
  const { members: syncedMembers } = useSyncedMembers({ enabled: open })

  const feedbackRequests = form.watch('feedback_requests')

  const memberOptions = useMemo(() => {
    const existingMembers = new Set(feedbackRequests?.map((request) => request.member.id))

    return syncedMembers
      .filter((m) => !existingMembers.has(m.id) && m.user.id !== currentUser?.id)
      .map((member) => ({
        value: member.id,
        label: member.user.display_name,
        leftSlot: <Avatar size='sm' name={member.user.display_name} urls={member.user.avatar_urls} />,
        badge: member.role === 'guest' ? <GuestBadge /> : undefined
      }))
  }, [currentUser?.id, feedbackRequests, syncedMembers])

  return (
    <ul className='flex w-full flex-col pt-3'>
      {feedbackRequests?.map((fr) => {
        return <FeedbackRequestListItem feedbackRequest={fr} form={form} key={fr.id} />
      })}

      {memberOptions && (
        <SelectPopover
          open={open}
          setOpen={setOpen}
          typeAhead
          placeholder={'Add someone...'}
          options={memberOptions}
          onChange={(value) => {
            const member = syncedMembers?.find((m) => m.id === value)

            if (member) {
              form.setValue(
                'feedback_requests',
                [...(feedbackRequests ?? []), { id: uuid(), member, has_replied: false }],
                { shouldDirty: true, shouldValidate: true }
              )
              setOpen(false)
            }
          }}
        >
          <li className='py-2 first-of-type:pt-0 last-of-type:pb-0'>
            <button
              type='button'
              className='dark:text-secondary dark:hover:text-primary group relative flex items-center justify-between gap-3 text-blue-500 hover:text-blue-600'
              onClick={() => setOpen(true)}
            >
              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-500 group-hover:bg-blue-500 group-hover:text-white dark:bg-neutral-700 dark:text-blue-100'>
                <ButtonPlusIcon />
              </div>
              <UIText inherit>Request someone specific (optional)</UIText>
            </button>
          </li>
        </SelectPopover>
      )}
    </ul>
  )
}

function FeedbackRequestListItem({
  feedbackRequest,
  form
}: {
  feedbackRequest: { id: string; member?: any; has_replied: boolean }
  form: UseFormReturn<PostSchema>
}) {
  const { data: currentUser } = useGetCurrentUser()
  const projectId = form.watch('project_id')

  return (
    <li key={feedbackRequest.id} className='group py-2 first-of-type:pt-0 last-of-type:pb-0'>
      <div className='group relative flex items-start justify-between gap-3'>
        <div className='text-secondary relative flex items-start gap-3'>
          <MemberAvatar member={feedbackRequest.member} size='sm' />
          <div className='flex flex-col pt-0.5'>
            <UIText weight='font-medium' primary className='line-clamp-1'>
              {feedbackRequest.member.user.display_name}
            </UIText>
          </div>
        </div>

        <div className='text-quaternary dark:text-tertiary flex flex-row items-center gap-4'>
          {!feedbackRequest.has_replied && feedbackRequest.member.user.id !== currentUser?.id && (
            <span className='group-hover:hidden'>
              <LinearBacklogIcon size={24} />
            </span>
          )}

          {feedbackRequest.has_replied && (
            <span className='text-blue-500'>
              <CheckCircleFilledIcon size={24} />
            </span>
          )}

          {!feedbackRequest.has_replied && (
            <button
              className='text-tertiary hidden hover:text-red-500 group-hover:flex'
              onClick={() => {
                const feedbackRequests = form.getValues('feedback_requests') ?? []

                form.setValue(
                  'feedback_requests',
                  feedbackRequests?.filter((request) => request.id !== feedbackRequest.id) ?? [],
                  { shouldDirty: true, shouldValidate: true }
                )
              }}
            >
              <span>
                <CircleFilledCloseIcon size={24} />
              </span>
            </button>
          )}
        </div>
      </div>
      {projectId && <AddToProjectSuggestion projectId={projectId} member={feedbackRequest.member} />}
    </li>
  )
}

function AddToProjectSuggestion({ projectId, member }: { projectId: string; member: OrganizationMember }) {
  const { data: project } = useGetProject({ id: projectId })
  const createProjectMembership = useCreateProjectMembership(projectId)
  const { data: infiniteProjectMemberUsers, isLoading } = useGetProjectMembers({
    projectId,
    organizationMembershipId: member.id
  })
  const userIsInProject = !!flattenInfiniteData(infiniteProjectMemberUsers)?.length

  if (!project || isLoading || userIsInProject) return null
  if (!project.private && member.role !== 'guest') return null

  const handleButtonClick = () => {
    createProjectMembership.mutate({ userId: member.user.id })
    toast(`Added ${member.user.display_name} to ${project.name}`)
  }

  return (
    <div className='pl-9'>
      <UIText tertiary size='text-xs'>
        Not in channel ·{' '}
        <button
          type='button'
          className='text-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
          onClick={handleButtonClick}
        >
          Add to {project.name}
        </button>
      </UIText>
    </div>
  )
}
