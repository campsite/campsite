import { Button, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { MemberAvatar } from '@/components/MemberAvatar'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

import { NoteSharePermissionsRow, Props } from './NoteSharePermissions'

export function NotePeoplePermissions({ note, permissions }: Props) {
  const { data: currentUser } = useGetCurrentUser()

  if ((permissions || []).length === 0) return null

  // show viewer's permission first in list
  const renderPermissions = (permissions || []).sort((a, b) => {
    if (a.user.id === currentUser?.id) return -1
    if (b.user.id === currentUser?.id) return 1
    return 0
  })

  return (
    <>
      <UIText
        size='text-xs'
        weight='font-medium'
        tertiary
        className={cn((note.viewer_can_edit || note.project_permission !== 'none') && 'mt-3')}
      >
        People with access
      </UIText>

      <ul className='flex flex-col gap-3'>
        {!note.viewer_is_author && (
          <li className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <MemberAvatar member={note.member} size='sm' />
              <UIText size='text-sm' weight='font-medium' className='line-clamp-1'>
                {note.member.user.display_name}
              </UIText>
            </div>
            <Button variant='plain' disabled>
              Owner
            </Button>
          </li>
        )}

        {renderPermissions.map((permission) => (
          <NoteSharePermissionsRow key={permission.id} permission={permission} note={note} />
        ))}
      </ul>
    </>
  )
}
