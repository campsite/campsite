import { useState } from 'react'
import { useRouter } from 'next/router'

import { Post } from '@campsite/types/generated'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer'
import { LockIcon } from '@campsite/ui/Icons'
import { Link } from '@campsite/ui/Link'
import { UIText } from '@campsite/ui/Text'

import { PostFavoriteButton } from '@/components/Post/PostFavoriteButton'
import { PostFollowUpDialog } from '@/components/Post/PostFollowUpDialog'
import { ProjectAccessoryBreadcrumbIcon } from '@/components/Titlebar/BreadcrumbPageIcons'
import { BreadcrumbLabel } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'

interface PostBreadcrumbsProps {
  post: Post
}

export function PostBreadcrumbs({ post }: PostBreadcrumbsProps) {
  const { scope } = useScope()
  const [followUpIsOpen, setFollowUpIsOpen] = useState(false)
  const isInbox = useRouter().pathname.startsWith('/[org]/inbox/[inboxView]')

  return (
    <>
      <LayeredHotkeys
        keys='f'
        callback={() => setFollowUpIsOpen(true)}
        options={{ enabled: !isInbox, skipEscapeWhenDisabled: true }}
      />

      {!isInbox && <PostFollowUpDialog post={post} open={followUpIsOpen} onOpenChange={setFollowUpIsOpen} />}

      <div className='flex min-w-0 flex-1 items-center gap-1.5'>
        <Link
          className='break-anywhere flex min-w-0 items-center gap-1 truncate'
          href={`/${scope}/projects/${post.project.id}`}
        >
          <ProjectAccessoryBreadcrumbIcon project={post.project} />
          <BreadcrumbLabel>{post.project.name}</BreadcrumbLabel>
          {post.project.private && <LockIcon size={16} className='text-tertiary' />}
        </Link>

        <UIText quaternary>/</UIText>
        <Link href={`/${scope}/posts/${post.id}`} className='break-anywhere min-w-0 truncate'>
          <BreadcrumbLabel className='ml-1'>{post.title || 'Untitled'}</BreadcrumbLabel>
        </Link>

        {post.viewer_is_organization_member && <PostFavoriteButton post={post} shortcutEnabled />}
      </div>
    </>
  )
}
