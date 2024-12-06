import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'

import { Project, SyncCustomReaction } from '@campsite/types'
import {
  Button,
  Checkbox,
  LockIcon,
  MinusIcon,
  MutationError,
  PlusIcon,
  ProjectIcon,
  RadioGroup,
  RadioGroupItem,
  TextField,
  UIText
} from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { ReactionPicker } from '@/components/Reactions/ReactionPicker'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { useUpdateProject } from '@/hooks/useUpdateProject'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'
import { isStandardReaction, StandardReaction } from '@/utils/reactions'

import { ViewerUpsellDialog } from '../../Upsell/ViewerUpsellDialog'
import { SlackBroadcast } from '../SlackBroadcast'

interface ProjectEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
}

export function ProjectEditDialog({ open, onOpenChange, project }: ProjectEditDialogProps) {
  const isCommunity = useIsCommunity()
  const updateProject = useUpdateProject(project.id)
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? '')
  const [accessory, setAccessory] = useState(project.accessory ?? '')
  const [slackChannelId, setSlackChannelId] = useState(project.slack_channel_id)
  const [slackChannelIsPrivate, setSlackChannelIsPrivate] = useState<boolean>()
  const [isDefault, setIsDefault] = useState(project.is_default)
  const [isPrivate, setIsPrivate] = useState(project.private)
  const viewerIsAdmin = useViewerIsAdmin()
  const getCurrentOrganization = useGetCurrentOrganization()
  const currentOrganization = getCurrentOrganization.data

  async function handleSubmit(e: any) {
    e.preventDefault()

    const hasSetSlack = slackChannelId !== null && slackChannelIsPrivate !== null

    const data = {
      name: name.trim(),
      description: description.trim(),
      accessory,
      slack_channel_id: hasSetSlack ? slackChannelId : null,
      slack_channel_is_private: hasSetSlack ? slackChannelIsPrivate : undefined,
      cover_photo_path: null,
      is_default: isDefault,
      private: isPrivate
    }

    updateProject.mutate(data, {
      onSuccess: () => {
        toast('Channel updated')
        onOpenChange(false)
      }
    })
  }

  const handleReactionSelect = useCallback((reaction: StandardReaction | SyncCustomReaction) => {
    if (!isStandardReaction(reaction)) return

    setAccessory(reaction.native)
  }, [])

  const handleRemoveAccessory = useCallback(() => {
    setAccessory('')
  }, [])

  const showDefault = !project.is_general && !project.archived && viewerIsAdmin && !isCommunity && !isPrivate
  const showVisibility = !project.is_general && !project.personal && project.viewer_can_update && !isCommunity
  const noMembers = project.members_count === 0

  if (!project.viewer_can_update) {
    return (
      <ViewerUpsellDialog
        open={open}
        onOpenChange={onOpenChange}
        icon={<ProjectIcon size={28} />}
        title='Channel editing is available to members'
      />
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='lg' disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>Edit channel</Dialog.Title>
      </Dialog.Header>

      <Dialog.Content>
        <div className='flex flex-1 flex-col'>
          <div className='flex flex-col gap-3'>
            <div className='flex w-full items-end gap-2 pt-2.5'>
              <div className='group/accessory relative'>
                {accessory && (
                  <button
                    onClick={handleRemoveAccessory}
                    className='text-primary bg-elevated absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full opacity-0 shadow ring-1 ring-gray-200 hover:bg-red-500 hover:text-white hover:ring-red-500 group-hover/accessory:opacity-100 dark:bg-gray-600 dark:ring-gray-700 dark:hover:bg-red-500'
                  >
                    <MinusIcon size={16} strokeWidth='2.5' />
                  </button>
                )}
                {!accessory && (
                  <span className='text-primary pointer-events-none absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-200 group-hover/accessory:bg-blue-500 group-hover/accessory:text-white group-hover/accessory:ring-blue-500 dark:bg-gray-600 dark:ring-gray-700'>
                    <PlusIcon size={13} strokeWidth='2.5' />
                  </span>
                )}
                <ReactionPicker
                  trigger={
                    <div className='dark:bg-quaternary hover:bg-quaternary text-secondary hover:text-primary hover:border-primary group flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md border p-1 text-xs font-medium'>
                      {accessory ? (
                        <UIText className='font-["emoji"]' size='text-base'>
                          {accessory}
                        </UIText>
                      ) : project.private ? (
                        <LockIcon />
                      ) : (
                        <ProjectIcon />
                      )}
                    </div>
                  }
                  onReactionSelect={handleReactionSelect}
                />
              </div>

              <div className='w-full'>
                <TextField
                  type='text'
                  value={name}
                  onChange={setName}
                  placeholder='Channel name'
                  maxLength={32}
                  minLength={2}
                  onCommandEnter={handleSubmit}
                />
              </div>
            </div>
            <TextField
              type='text'
              value={description ?? undefined}
              onChange={(value) => setDescription(value)}
              placeholder='Description (optional)'
              maxLength={280}
              minLength={2}
              minRows={3}
              maxRows={6}
              multiline
              onCommandEnter={handleSubmit}
            />

            {!project.personal && (
              <SlackBroadcast
                open={open}
                isAdmin={viewerIsAdmin}
                slackChannelId={slackChannelId}
                setSlackChannelId={setSlackChannelId}
                setSlackChannelIsPrivate={setSlackChannelIsPrivate}
              />
            )}

            <div className='text-secondary flex w-full items-start gap-2'>
              {project.private ? <LockIcon /> : <ProjectIcon />}
              <div className='flex-1'>
                <UIText weight='font-medium' inherit>
                  Visibility
                </UIText>
                {showVisibility ? (
                  <div className='items-center gap-1 pt-2'>
                    <RadioGroup
                      loop
                      aria-label='Visibility'
                      value={isPrivate ? 'private' : 'public'}
                      className='flex flex-col gap-3'
                      orientation='vertical'
                      onValueChange={(value) => {
                        setIsPrivate(value === 'private')
                        if (value === 'private') setIsDefault(false)
                      }}
                    >
                      <RadioGroupItem id='public' value='public'>
                        <UIText secondary>
                          Public — visible to anyone at{' '}
                          <span className='text-primary font-semibold'>{currentOrganization?.name}</span>
                        </UIText>
                        {showDefault && (
                          <div className='text-secondary mt-2 w-full gap-2'>
                            <div className='flex flex-row gap-2'>
                              <div>
                                <Checkbox className='focus:ring-0' checked={isDefault} onChange={setIsDefault} />
                              </div>
                              <div onClick={() => setIsDefault(!isDefault)}>
                                <UIText weight='font-medium' inherit>
                                  Default channel
                                </UIText>
                                <UIText tertiary>
                                  When people join your organization in the future, they will be automatically added to
                                  this channel.
                                </UIText>
                              </div>
                            </div>
                          </div>
                        )}
                      </RadioGroupItem>
                      <RadioGroupItem id='private' value='private'>
                        <UIText secondary>Private — only visible to members of this channel</UIText>
                        {!project.viewer_is_member &&
                          isPrivate &&
                          (noMembers ? (
                            <div className='mt-2 justify-center gap-2 rounded-lg bg-red-50 p-2.5 text-red-900 dark:bg-red-300/10 dark:text-red-200'>
                              <UIText inherit>Private channels must have at least one member.</UIText>
                            </div>
                          ) : (
                            <div className='mt-2 justify-center gap-2 rounded-lg bg-amber-50 p-2.5 text-amber-900 dark:bg-amber-300/10 dark:text-amber-200'>
                              <UIText inherit>
                                You are not a member of this channel. Making it private will remove your access.
                              </UIText>
                            </div>
                          ))}
                      </RadioGroupItem>
                    </RadioGroup>
                  </div>
                ) : (
                  <UIText tertiary>
                    This channel is <b>{project.private ? 'private' : 'public'}</b>.{' '}
                    {showDefault && 'Default channels cannot be private.'}
                  </UIText>
                )}
              </div>
            </div>

            {updateProject.isError && (
              <div className='flex flex-col text-sm text-red-500'>
                <MutationError mutation={updateProject} />
              </div>
            )}
          </div>
        </div>
      </Dialog.Content>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={handleSubmit}
            disabled={!name || updateProject.isPending || (isPrivate && noMembers)}
          >
            {updateProject.isPending ? 'Updating...' : 'Save'}
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
