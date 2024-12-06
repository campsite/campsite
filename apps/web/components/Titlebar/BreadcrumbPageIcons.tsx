import { Project } from '@campsite/types/generated'
import {
  ChatBubbleIcon,
  HashtagIcon,
  HomeIcon,
  NoteFilledIcon,
  PostDraftIcon,
  PostFilledIcon,
  ProjectIcon,
  SquircleIconContainer,
  UIText,
  UserCircleFilledIcon,
  VideoCameraFilledIcon
} from '@campsite/ui'

import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'

export function HomeBreadcrumbIcon() {
  return (
    <SquircleIconContainer className='text-transparent' size='small'>
      <HomeIcon className='text-primary relative z-10' />
    </SquircleIconContainer>
  )
}

export function NoteBreadcrumbIcon() {
  return (
    <SquircleIconContainer className='text-blue-500' size='small'>
      <NoteFilledIcon className='relative z-10 text-white' />
    </SquircleIconContainer>
  )
}

export function CallBreadcrumbIcon() {
  return (
    <SquircleIconContainer className='text-green-500' size='small'>
      <VideoCameraFilledIcon size={16} className='relative z-10 text-white' />
    </SquircleIconContainer>
  )
}

export function PeopleBreadcrumbIcon() {
  return (
    <SquircleIconContainer className='text-red-500' size='small'>
      <UserCircleFilledIcon className='relative z-10 text-white' />
    </SquircleIconContainer>
  )
}

export function ProjectAccessoryBreadcrumbIcon({
  project
}: {
  project?: Pick<Project, 'accessory' | 'message_thread_id'>
}) {
  const hasNoEmojiAccessories = useCurrentUserOrOrganizationHasFeature('no_emoji_accessories')
  const isChatProject = !!project?.message_thread_id
  const showAccessory = !!project?.accessory && !hasNoEmojiAccessories

  return (
    <SquircleIconContainer className='text-transparent' size='small'>
      {showAccessory && (
        <UIText className='text-primary relative z-10 mt-0.5 font-["emoji"] text-[18px] leading-none'>
          {project?.accessory}
        </UIText>
      )}
      {!showAccessory &&
        (isChatProject ? (
          <ChatBubbleIcon className='text-primary' size={24} />
        ) : (
          <ProjectIcon className='text-primary' size={24} />
        ))}
    </SquircleIconContainer>
  )
}

export function TagBreadcrumbIcon() {
  return (
    <SquircleIconContainer className='text-transparent' size='small'>
      <HashtagIcon className='text-primary relative z-10' />
    </SquircleIconContainer>
  )
}

export function PostBreadcrumbIcon() {
  return (
    <SquircleIconContainer className='text-gray-800 dark:text-gray-700' size='small'>
      <PostFilledIcon className='relative z-10 text-white' />
    </SquircleIconContainer>
  )
}

export function DraftBreadcrumbIcon() {
  return (
    <SquircleIconContainer className='text-transparent' size='small'>
      <PostDraftIcon className='text-primary relative z-10' size={24} />
    </SquircleIconContainer>
  )
}
