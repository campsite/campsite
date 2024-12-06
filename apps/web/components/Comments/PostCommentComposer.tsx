import { useCallback } from 'react'
import { FormProvider } from 'react-hook-form'

import { Comment } from '@campsite/types/generated'

import { useCommentForm } from '@/components/Comments/hooks/useCommentForm'
import { useCreatePostView } from '@/hooks/useCreatePostView'
import { useGetPost } from '@/hooks/useGetPost'
import { usePostCommentDefaultMentionables } from '@/hooks/usePostCommentDefaultMentionables'

import { CommentComposer, CommentComposerProps } from './CommentComposer'

interface PostCommentComposerProps extends Omit<CommentComposerProps, 'subjectId' | 'subjectType'> {
  postId: string
}

export function PostCommentComposer({ postId, onCreated, ...props }: PostCommentComposerProps) {
  const { mutate: createPostView } = useCreatePostView()

  const defaultMentions = usePostCommentDefaultMentionables({ postId })

  const onPostCreated = useCallback(
    (comment: Comment) => {
      createPostView({ postId, read: true, clearUnseenComments: true })
      onCreated?.(comment)
    },
    [createPostView, postId, onCreated]
  )

  const composerProps: CommentComposerProps = {
    ...props,
    subjectId: postId,
    subjectType: 'post',
    onCreated: onPostCreated,
    defaultMentions
  }

  const methods = useCommentForm(composerProps)
  const { data: post } = useGetPost({ postId })

  if (!post) return null
  if (!post.viewer_is_organization_member) return null

  return (
    <FormProvider {...methods}>
      <CommentComposer {...composerProps} />
    </FormProvider>
  )
}
