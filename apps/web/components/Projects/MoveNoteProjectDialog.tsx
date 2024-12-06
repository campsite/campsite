import { useRef, useState } from 'react'

import { Note, Project } from '@campsite/types'
import {
  AlertIcon,
  Button,
  ButtonPlusIcon,
  CheckCircleFilledIcon,
  Command,
  LockIcon,
  ProjectIcon,
  SearchIcon,
  UIText
} from '@campsite/ui'
import { HighlightedCommandItem } from '@campsite/ui/Command'
import * as Dialog from '@campsite/ui/src/Dialog'

import { CreateProjectDialog } from '@/components/Projects/Create/CreateProjectDialog'
import { ProjectPermissionsSelect } from '@/components/Projects/ProjectPermissionsSelect'
import { useDeleteNoteProjectPermission } from '@/hooks/useDeleteNoteProjectPermission'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useSyncedProjects } from '@/hooks/useSyncedProjects'
import { useUpdateNoteProjectPermission } from '@/hooks/useUpdateNoteProjectPermission'
import { apiErrorToast } from '@/utils/apiErrorToast'

interface Props {
  note: Note
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MoveNoteProjectDialog({ note, open, onOpenChange }: Props) {
  const updateNoteProjectPermission = useUpdateNoteProjectPermission()
  const deleteNoteProjectPermission = useDeleteNoteProjectPermission()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState(note.project?.id)
  const [selectedProjectPermission, setSelectedProjectPermission] = useState(
    note.project_permission !== 'none' ? note.project_permission : 'view'
  )
  const { projects } = useSyncedProjects({ enabled: open, excludeChatProjects: true })
  const isDangerousPrivateChange =
    note.project?.private && !projects.find((project) => project.id === selectedProjectId)?.private
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: organization } = useGetCurrentOrganization()

  function onSave(event: any) {
    event.preventDefault()

    const callbacks = {
      onSettled: () => onOpenChange(false),
      onError: apiErrorToast
    }

    if (selectedProjectId) {
      updateNoteProjectPermission.mutate(
        {
          noteId: note.id,
          project_id: selectedProjectId,
          permission: selectedProjectPermission
        },
        callbacks
      )
    } else {
      deleteNoteProjectPermission.mutate({ noteId: note.id }, callbacks)
    }
  }

  function handleCreate(project: Project) {
    setSelectedProjectId(project.id)
    setIsCreating(false)
  }

  function onCancel() {
    setSelectedProjectId(note.project?.id)
    setSelectedProjectPermission(note.project_permission !== 'none' ? note.project_permission : 'view')
    onOpenChange(false)
  }

  function handleOpenChange(open: boolean) {
    onOpenChange(open)
  }

  return (
    <>
      <CreateProjectDialog onCreate={handleCreate} open={isCreating} onOpenChange={setIsCreating} />

      <Dialog.Root open={open} onOpenChange={handleOpenChange} size='lg' align='top' disableDescribedBy>
        <Dialog.Header className='pb-0'>
          <Dialog.Title>Move to channel...</Dialog.Title>
        </Dialog.Header>

        <Command
          className='flex max-h-[40vh] min-h-[30dvh] flex-1 flex-col overflow-hidden outline-none'
          defaultValue={note.project?.id}
          loop
        >
          <div className='flex items-center gap-3 border-b px-3'>
            <div className='flex h-6 w-6 items-center justify-center'>
              <SearchIcon className='text-quaternary' />
            </div>
            <Command.Input
              ref={inputRef}
              placeholder='Search channels...'
              className='w-full border-0 bg-transparent py-3 pl-0 pr-4 text-[15px] placeholder-gray-400 outline-none focus:border-black focus:border-black/5 focus:ring-0'
            />
          </div>

          <Command.List className='scrollbar-hide overflow-y-auto'>
            <Command.Empty className='flex h-full w-full flex-1 flex-col items-center justify-center gap-1 p-8 pt-12'>
              <UIText weight='font-medium' quaternary>
                No channels found
              </UIText>
            </Command.Empty>

            <Command.Group className='p-3'>
              <HighlightedCommandItem
                className='group h-10 gap-3 rounded-lg pr-1.5'
                onSelect={() => setSelectedProjectId(undefined)}
              >
                <LockIcon />
                <span className='line-clamp-1 flex-1'>Private</span>
                {selectedProjectId === undefined ? (
                  <CheckCircleFilledIcon size={24} className='text-blue-500' />
                ) : (
                  <span />
                )}
              </HighlightedCommandItem>

              {projects?.map((project) => (
                <HighlightedCommandItem
                  key={project.id}
                  className='group h-10 gap-3 rounded-lg pr-1.5'
                  onSelect={() => setSelectedProjectId(project.id)}
                >
                  {project.accessory ? (
                    <UIText className='flex h-6 w-6 items-center justify-center text-center font-["emoji"]'>
                      {project.accessory}
                    </UIText>
                  ) : project.private ? (
                    <LockIcon />
                  ) : (
                    <ProjectIcon />
                  )}
                  <span className='line-clamp-1 flex-1'>{project.name}</span>
                  {project.id === selectedProjectId ? (
                    <CheckCircleFilledIcon size={24} className='text-blue-500' />
                  ) : (
                    <span />
                  )}
                </HighlightedCommandItem>
              ))}
            </Command.Group>
          </Command.List>
        </Command>

        <Dialog.Footer>
          <div className='flex flex-1 flex-col gap-3'>
            {isDangerousPrivateChange && (
              <div className='flex items-start gap-2 rounded-md bg-orange-100 p-2 text-orange-800 dark:bg-orange-500/10 dark:text-orange-200'>
                <span>
                  <AlertIcon />
                </span>
                <UIText inherit>
                  This doc is in a private channel. Are you sure you want to move it to a public channel?
                </UIText>
              </div>
            )}
            {note.project_pin_id && (
              <div className='flex items-start gap-2 rounded-md bg-orange-100 p-2 text-orange-800 dark:bg-orange-500/10 dark:text-orange-200'>
                <span>
                  <AlertIcon />
                </span>
                <UIText inherit>
                  Moving this doc will unpin it from the top of the channel. You can pin it again after moving it.
                </UIText>
              </div>
            )}
            <div className='flex w-full items-center justify-between'>
              {organization?.viewer_can_see_new_project_button && (
                <Button leftSlot={<ButtonPlusIcon />} onClick={() => setIsCreating(true)}>
                  New channel
                </Button>
              )}

              <div className='flex items-center gap-2'>
                <ProjectPermissionsSelect
                  selected={selectedProjectPermission}
                  onChange={setSelectedProjectPermission}
                  disabled={!selectedProjectId}
                />
                <Button variant='flat' onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  variant={isDangerousPrivateChange ? 'destructive' : 'primary'}
                  type='submit'
                  onClick={onSave}
                  disabled={updateNoteProjectPermission.isPending || deleteNoteProjectPermission.isPending}
                >
                  {isDangerousPrivateChange ? 'Move to channel' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Footer>
      </Dialog.Root>
    </>
  )
}
