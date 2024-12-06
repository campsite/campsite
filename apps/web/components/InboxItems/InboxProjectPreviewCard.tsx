import { useMemo } from 'react'
import pluralize from 'pluralize'
import toast from 'react-hot-toast'

import { Post, Project } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import {
  ArrowRightIcon,
  BellCheckIcon,
  BellIcon,
  ClockIcon,
  LockIcon,
  StarFilledIcon,
  StarOutlineIcon
} from '@campsite/ui/Icons'
import { Link } from '@campsite/ui/Link'
import { RelativeTime } from '@campsite/ui/RelativeTime'
import { UIText } from '@campsite/ui/Text'
import { cn } from '@campsite/ui/utils'

import { FacePile } from '@/components/FacePile'
import { MemberAvatar } from '@/components/MemberAvatar'
import { useScope } from '@/contexts/scope'
import { useCreateProjectFavorite } from '@/hooks/useCreateProjectFavorite'
import { useCreateProjectSubscription } from '@/hooks/useCreateProjectSubscription'
import { useDeleteProjectFavorite } from '@/hooks/useDeleteProjectFavorite'
import { useDeleteProjectSubscription } from '@/hooks/useDeleteProjectSubscription'
import { useGetProjectMembers } from '@/hooks/useGetProjectMembers'
import { useGetProjectPosts } from '@/hooks/useGetProjectPosts'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

// ----------------------------------------------------------------------------

interface RecentPostProps {
  post: Post
}

function RecentPost({ post }: RecentPostProps) {
  const { scope } = useScope()

  return (
    <Link
      href={`/${scope}/posts/${post.id}`}
      key={post.id}
      className='hover:bg-tertiary flex flex-1 items-center gap-3 rounded-lg p-2'
    >
      <MemberAvatar member={post.member} size='base' />
      <div className='flex flex-col'>
        <UIText tertiary>
          {post.member.user.display_name} · <RelativeTime time={post.published_at || post.created_at} />
        </UIText>
        <UIText weight='font-medium' className='break-anywhere line-clamp-1'>
          {post.title || post.truncated_description_text}
        </UIText>
      </div>
    </Link>
  )
}

// ----------------------------------------------------------------------------

interface ProjectPreviewRecentPostsProps {
  project: Project
}

function ProjectPreviewRecentPosts({ project }: ProjectPreviewRecentPostsProps) {
  const { scope } = useScope()
  const getPosts = useGetProjectPosts({ projectId: project.id, enabled: true })
  const posts = useMemo(() => flattenInfiniteData(getPosts.data)?.slice(0, 4) || [], [getPosts.data])

  if (posts.length === 0) return null

  return (
    <div className='bg-elevated flex w-full max-w-md flex-col rounded-lg border p-2'>
      <div className='gap-4.5 flex items-center px-3.5 py-2'>
        <ClockIcon />
        <UIText weight='font-semibold'>Recent posts</UIText>
      </div>

      {posts.slice(0, 3).map((post) => (
        <RecentPost post={post} key={post.id} />
      ))}

      {posts.length > 3 && (
        <Link
          href={`/${scope}/projects/${project.id}`}
          className='hover:bg-tertiary text-tertiary hover:text-primary mt-1 flex flex-1 items-center justify-center gap-3 rounded-lg p-2 text-center'
        >
          <UIText inherit>View more</UIText>
          <ArrowRightIcon size={16} strokeWidth='2' />
        </Link>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------------

interface InboxProjectPreviewCardProps {
  project: Project
}

function InboxProjectPreviewCard({ project }: InboxProjectPreviewCardProps) {
  const { scope } = useScope()
  const { mutate: deleteProjectSubscription, isPending: isDeletingSubscription } = useDeleteProjectSubscription(
    project.id
  )
  const { mutate: createProjectSubscription, isPending: isCreatingSubscription } = useCreateProjectSubscription(
    project.id
  )
  const { mutate: createFavorite, isPending: isCreatingFavorite } = useCreateProjectFavorite()
  const { mutate: deleteFavorite, isPending: isDeletingFavorite } = useDeleteProjectFavorite()
  const getMembers = useGetProjectMembers({ projectId: project.id, limit: 6 })
  const memberUsers = flattenInfiniteData(getMembers.data)?.map((member) => member.user)

  const subscriptionIsLoading = isCreatingSubscription || isDeletingSubscription
  const favoriteIsLoading = isCreatingFavorite || isDeletingFavorite
  const showFavoriteButton = project.viewer_is_member
  const showSubscriptionButton = project.viewer_has_subscribed || !project.archived

  return (
    <div className='bg-secondary dark:bg-primary flex flex-1 flex-col items-center justify-center gap-6 p-6'>
      <div
        className={cn('bg-elevated relative flex w-full max-w-md flex-col rounded-lg border p-4', {
          'border-b-primary border-l-primary border-r-primary rounded-t-none border-t-2 border-t-yellow-400 after:pointer-events-none after:absolute after:left-1/2 after:top-0 after:-translate-x-1/2 after:rounded-b-md after:bg-yellow-400 after:px-2.5 after:py-1 after:font-mono after:text-[10px] after:font-semibold after:uppercase after:tracking-wider after:text-yellow-800 after:content-["Archived"]':
            project.archived
        })}
      >
        {project.accessory && (
          <Link
            href={`/${scope}/projects/${project.id}`}
            className='mb-2 flex h-8 w-8 items-center justify-center font-["emoji"] text-2xl'
          >
            {project.accessory}
          </Link>
        )}
        <Link href={`/${scope}/projects/${project.id}`} className='flex flex-wrap items-center gap-3 break-all'>
          <UIText size='text-base' weight='font-semibold'>
            {project.name}
          </UIText>

          {project.private && <LockIcon size={28} className='text-tertiary' />}
        </Link>

        {project.description && (
          <UIText className='mt-1 line-clamp-3 whitespace-pre-wrap' tertiary>
            {project.description}
          </UIText>
        )}

        {memberUsers && memberUsers.length > 1 && getMembers.total && (
          <div className='mt-4 flex items-center gap-3'>
            <FacePile users={memberUsers} limit={5} size='sm' totalUserCount={getMembers.total} />
            <UIText size='text-sm' tertiary>
              {getMembers.total} {pluralize('member', getMembers.total)}
            </UIText>
          </div>
        )}

        <div className='mt-4 flex flex-col gap-3'>
          {(showSubscriptionButton || showFavoriteButton) && (
            <div className='flex items-center gap-3'>
              {showSubscriptionButton && (
                <Button
                  fullWidth
                  variant='base'
                  disabled={subscriptionIsLoading}
                  onClick={() => {
                    if (project.viewer_has_subscribed) {
                      deleteProjectSubscription(undefined, { onSuccess: () => toast('Unsubscribed from channel') })
                    } else {
                      createProjectSubscription({ cascade: false }, { onSuccess: () => toast('Subscribed to channel') })
                    }
                  }}
                  leftSlot={project.viewer_has_subscribed ? <BellCheckIcon /> : <BellIcon />}
                >
                  {project.viewer_has_subscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              )}

              {showFavoriteButton && (
                <Button
                  fullWidth
                  variant='base'
                  disabled={favoriteIsLoading}
                  onClick={() => {
                    if (project.viewer_has_favorited) {
                      deleteFavorite(project.id)
                    } else {
                      createFavorite(project)
                    }
                  }}
                  leftSlot={
                    project.viewer_has_favorited ? (
                      <StarFilledIcon
                        className={cn({
                          'hover:text-primary text-yellow-400': project.viewer_has_favorited,
                          'text-quaternary hover:text-primary': !project.viewer_has_favorited
                        })}
                      />
                    ) : (
                      <StarOutlineIcon />
                    )
                  }
                >
                  {project.viewer_has_favorited ? 'Favorited' : 'Favorite'}
                </Button>
              )}
            </div>
          )}

          <Button className='flex-none' variant='primary' fullWidth href={`/${scope}/projects/${project.id}`}>
            View channel
          </Button>
        </div>
      </div>

      {!project.archived && <ProjectPreviewRecentPosts project={project} />}
    </div>
  )
}

// ----------------------------------------------------------------------------

export { InboxProjectPreviewCard }
