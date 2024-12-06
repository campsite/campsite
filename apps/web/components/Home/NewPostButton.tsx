import { Avatar } from '@campsite/ui/Avatar'
import { Button } from '@campsite/ui/Button'
import {
  AnnouncementIcon,
  CalendarIcon,
  CloseIcon,
  PencilIcon,
  PlusIcon,
  QuestionMarkCircleIcon
} from '@campsite/ui/Icons'
import { UIText } from '@campsite/ui/Text'
import { cn } from '@campsite/ui/utils'

import { PostComposerType, usePostComposer } from '@/components/PostComposer'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useUpdatePreference } from '@/hooks/useUpdatePreference'

export function NewPostButton({ className }: { className?: string }) {
  const currentUser = useGetCurrentUser().data
  const { showPostComposer } = usePostComposer()
  const canPost = useGetCurrentOrganization().data?.viewer_can_post

  if (!canPost || !currentUser) return null

  return (
    <div>
      <div
        className={cn(
          'text-tertiary relative -mx-2 flex items-center gap-3 rounded-lg',
          'hover:bg-elevated dark:bg-secondary dark:hover:bg-tertiary border-0 bg-[#fcfcfc] px-4 py-3 shadow-sm ring-[0.5px] ring-black/[0.08] transition-all hover:shadow dark:shadow-[inset_0px_0px_0px_0.5px_rgb(255_255_255_/_0.06),_0px_1px_2px_rgb(0_0_0_/_0.2),_0px_2px_4px_rgb(0_0_0_/_0.12),_0px_0px_0px_0.5px_rgb(0_0_0_/_0.12)]',
          className
        )}
      >
        <div className='relative'>
          <Avatar size='lg' clip='notificationReason' urls={currentUser.avatar_urls} />
          <span className='h-5.5 w-5.5 absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-black text-white dark:bg-white/10'>
            <PlusIcon size={18} strokeWidth='2.5' />
          </span>
        </div>

        <UIText inherit size='text-[15px]'>
          What do you want to share?
        </UIText>

        <div className='flex-1' />

        <Button variant='primary' className='pointer-events-none' disabled>
          Post
        </Button>
        <button className='absolute inset-0' onClick={() => showPostComposer()} />
      </div>
      <OnboardingComposerPrompts />
    </div>
  )
}

function OnboardingComposerPrompts() {
  const { data: currentUser } = useGetCurrentUser()
  const { mutate: updateUserPreference } = useUpdatePreference()
  const { showPostComposer } = usePostComposer()
  const canPost = useGetCurrentOrganization().data?.viewer_can_post

  if (!canPost || !currentUser) return null
  if (currentUser?.preferences?.channel_composer_post_suggestions) return null

  return (
    <div className='bg-tertiary -mx-2 -mt-2.5 flex flex-col items-start justify-between rounded-b-2xl dark:bg-neutral-900/50'>
      <div className='pt-5.5 flex w-full items-center gap-2 p-4 pb-2.5 pr-2.5'>
        <UIText className='flex-1' weight='font-medium' size='text-xs' tertiary>
          Suggestions
        </UIText>
        <Button
          size='sm'
          iconOnly={<CloseIcon size={16} strokeWidth='2' />}
          accessibilityLabel='Dismiss'
          variant='plain'
          onClick={() => {
            updateUserPreference({
              preference: 'channel_composer_post_suggestions',
              value: 'true'
            })
          }}
        />
      </div>

      <div className='flex flex-wrap gap-2 p-4 pt-0'>
        <Button
          onClick={() => {
            showPostComposer({
              type: PostComposerType.DraftFromText,
              title: 'Daily standup',
              body: 'What did everyone work on today? Share you update in the comments.'
            })
          }}
          variant='flat'
          leftSlot={<CalendarIcon size={16} />}
        >
          Start a daily standup
        </Button>
        <Button
          onClick={() => {
            showPostComposer({
              type: PostComposerType.DraftFromText,
              title: 'Project update: ',
              body: 'Here’s my update for Project X:<br/><br/><strong>Project status:</strong><br/><br/><strong>What we’re working on:</strong><br/><br/><strong>Blockers:</strong>'
            })
          }}
          variant='flat'
          leftSlot={<PencilIcon size={16} />}
        >
          Write a project update
        </Button>
        <Button
          onClick={() => {
            showPostComposer({
              type: PostComposerType.DraftFromText,
              title: 'Announcement: ',
              body: 'Hey everyone, I’m excited to announce...'
            })
          }}
          variant='flat'
          leftSlot={<AnnouncementIcon size={16} />}
        >
          Make an announcement
        </Button>
        <Button
          onClick={() => {
            showPostComposer({
              type: PostComposerType.DraftFromText,
              title: 'How do we...?',
              body: 'Does anyone know the best way to accomplish...'
            })
          }}
          variant='flat'
          leftSlot={<QuestionMarkCircleIcon size={16} />}
        >
          Ask a question
        </Button>
      </div>
    </div>
  )
}
