import toast from 'react-hot-toast'

import { Post } from '@campsite/types/generated'
import { LayeredHotkeys } from '@campsite/ui/DismissibleLayer/LayeredHotkeys'
import { Switch } from '@campsite/ui/Switch'
import { UIText } from '@campsite/ui/Text'
import { cn } from '@campsite/ui/utils'

import { useCreatePostSubscription } from '@/hooks/useCreatePostSubscription'
import { useDeletePostSubscription } from '@/hooks/useDeletePostSubscription'

interface CommentListHeaderProps {
  post?: Post
  className?: string
}

export function CommentListHeader({ post, className }: CommentListHeaderProps) {
  const deletePostSubscription = useDeletePostSubscription()
  const createPostSubscription = useCreatePostSubscription()

  function handleSubscribe() {
    if (!post) return

    if (post.viewer_has_subscribed) {
      deletePostSubscription.mutate(post.id, {
        onSuccess: () => toast('Unsubscribed from post')
      })
    } else {
      createPostSubscription.mutate(post.id, {
        onSuccess: () => toast('Subscribed to post')
      })
    }
  }
  return (
    <div
      id='comment-list-header'
      className={cn(
        'flex scroll-mt-4 items-center gap-1.5',
        'h-7.5', // style the same height as a <Button> to avoid layout shift when resolved comments are toggled
        className
      )}
    >
      <UIText size='text-[15px]' weight='font-semibold' className='flex-1'>
        Activity
      </UIText>

      <LayeredHotkeys keys='s' options={{ enabled: post?.viewer_is_organization_member }} callback={handleSubscribe} />
      {post?.viewer_is_organization_member && (
        <Switch label='Notifications' checked={post.viewer_has_subscribed} onChange={handleSubscribe} />
      )}
    </div>
  )
}
