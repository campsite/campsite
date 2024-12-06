import toast from 'react-hot-toast'

import { Note, Permission } from '@campsite/types'
import { Button, UIText } from '@campsite/ui'

import { MemberAvatar } from '@/components/MemberAvatar'
import { useDeleteNotePermission } from '@/hooks/useDeleteNotePermission'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useUpdateNotePermission } from '@/hooks/useUpdateNotePermissions'

import { NotePeoplePermissionSelect, permissionActionToLabel } from './NotePeoplePermissionSelect'

export interface Props {
  note: Note
  permissions?: Permission[]
}

interface NoteSharePermissionsRowProps {
  permission: Permission
  note: Note
}

export function NoteSharePermissionsRow({ permission, note }: NoteSharePermissionsRowProps) {
  const { mutate: updatePermission } = useUpdateNotePermission()
  const { mutate: deletePermission } = useDeleteNotePermission()
  const { data: currentUser } = useGetCurrentUser()

  return (
    <li className='flex items-center justify-between gap-3'>
      <div className='flex items-center gap-2'>
        <MemberAvatar member={{ user: permission.user, deactivated: false }} size='sm' />
        <UIText size='text-sm' weight='font-medium' className='line-clamp-1'>
          {permission.user.display_name}
        </UIText>
      </div>
      <div className='flex items-center gap-1'>
        {note.viewer_can_edit && permission.user.id !== currentUser?.id ? (
          <NotePeoplePermissionSelect
            allowNone={note.viewer_can_edit}
            selected={permission.action}
            onChange={(value) => {
              if (value === 'none') {
                deletePermission({ noteId: note.id, permissionId: permission.id })
                return
              } else {
                updatePermission(
                  { noteId: note.id, permissionId: permission.id, permission: value },
                  {
                    onSuccess: () => {
                      toast('Permission updated')
                    }
                  }
                )
              }
            }}
          />
        ) : (
          <Button variant='plain' disabled>
            {permissionActionToLabel(permission.action)}
          </Button>
        )}
      </div>
    </li>
  )
}
