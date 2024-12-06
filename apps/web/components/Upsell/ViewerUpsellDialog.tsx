import { WEB_URL } from '@campsite/config'
import { Avatar, Button, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useSearchOrganizationMembers } from '@/hooks/useSearchOrganizationMembers'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon: React.ReactNode
  title: string
}

export function ViewerUpsellDialog({ open, onOpenChange, icon, title }: Props) {
  const searchOrganizationMembers = useSearchOrganizationMembers({ roles: ['admin'], enabled: open })
  const admins = flattenInfiniteData(searchOrganizationMembers.data)
  const { data: organization } = useGetCurrentOrganization({ enabled: open })
  const { data: currentUser } = useGetCurrentUser()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='xl' visuallyHiddenTitle={title} disableDescribedBy>
      <Dialog.Content>
        <div className='flex flex-col justify-center gap-4 px-1 pb-2 pt-6'>
          {icon}
          <div className='flex flex-col gap-2'>
            <UIText weight='font-semibold' size='text-base'>
              {title}
            </UIText>
            <UIText secondary>
              You are currently a <strong>viewer</strong> in {organization?.name}, which means you can view and comment
              on any post. Ask an admin to upgrade you to a <strong>member</strong> to:
            </UIText>

            <ul className='text-secondary m-0 pl-4 text-sm'>
              <li className='list-disc py-1'>Write and share unlimited posts and notes</li>
              <li className='list-disc py-1'>Create new channels and tags</li>
            </ul>
          </div>

          {admins && (
            <div className='bg-tertiary flex flex-col gap-3 rounded-lg p-4'>
              <UIText weight='font-medium'>Send an email to an admin to request a member role</UIText>
              {admins.map((member) => (
                <div className='flex-1 text-sm' key={member.id}>
                  <div className='flex items-center gap-3'>
                    <Avatar name={member.user.display_name} size='base' urls={member.user.avatar_urls} />
                    <div className='flex-1'>
                      <UIText weight='font-medium' className='line-clamp-1'>
                        {member.user.display_name}
                      </UIText>
                      <UIText tertiary selectable className='line-clamp-1'>
                        {member.user.email}
                      </UIText>
                    </div>
                    <Button
                      href={`mailto:${member.user.email}?subject=Campsite member role request from ${currentUser?.display_name} (${currentUser?.email})&body=Hi ${member.user.display_name},%0D%0A%0D%0AI would like to request a member role on our team’s Campsite to write my own posts.%0D%0A%0D%0AHere's a link to manage team roles in our org settings: ${WEB_URL}/${organization?.slug}/people%0D%0A%0D%0AThanks!`}
                      variant='primary'
                    >
                      Email
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog.Content>
      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
