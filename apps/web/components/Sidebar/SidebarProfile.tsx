import { useSetAtom } from 'jotai'

import { Button } from '@campsite/ui/Button'
import { QuestionMarkCircleIcon } from '@campsite/ui/Icons'

import { setFeedbackDialogOpenAtom } from '@/components/Feedback/FeedbackDialog'
import { MemberAvatar } from '@/components/MemberAvatar'
import { ChangelogDropdown } from '@/components/NavigationSidebar/ChangelogDropdown'
import { ProfileDropdown } from '@/components/NavigationSidebar/ProfileDropdown'
import { StatusPicker } from '@/components/StatusPicker'
import { useScope } from '@/contexts/scope'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

export function SidebarProfile() {
  const { scope } = useScope()
  const { data: currentUser } = useGetCurrentUser()
  const setFeedbackDialogOpen = useSetAtom(setFeedbackDialogOpenAtom)

  return (
    <div className='flex items-center gap-px'>
      <div className='flex items-center gap-1'>
        <ProfileDropdown
          trigger={
            <Button
              round
              variant='plain'
              href={`/${scope}/people/${currentUser?.username}`}
              accessibilityLabel='Profile and settings'
              tooltip='Profile and settings'
              iconOnly={currentUser && <MemberAvatar displayStatus member={{ user: currentUser }} size='sm' />}
            />
          }
          align='start'
          side='top'
        />
        <StatusPicker />
      </div>

      {/* spacer */}
      <div className='flex-1' />

      <Button
        variant='plain'
        iconOnly={<QuestionMarkCircleIcon />}
        accessibilityLabel='Share feedback'
        tooltip='Share feedback'
        onClick={() => setFeedbackDialogOpen(true)}
        className='text-tertiary hover:text-primary'
      />

      <ChangelogDropdown align='start' side='bottom' />
    </div>
  )
}
