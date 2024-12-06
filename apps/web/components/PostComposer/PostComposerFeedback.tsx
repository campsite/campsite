import { memo } from 'react'
import { useFormContext } from 'react-hook-form'

import { FeedbackRequestAltIcon, UIText } from '@campsite/ui'

import { PostSchema } from '../Post/schema'
import { useFormSetValue } from './hooks/useFormSetValue'
import { PostComposerFeedbackManager } from './PostComposerFeedbackManager'
import { PostComposerRemoveButton } from './PostComposerRemoveButton'

export const PostComposerFeedback = memo(function PostComposerFeedback() {
  const methods = useFormContext<PostSchema>()
  const setValue = useFormSetValue<PostSchema>()

  function handleRemove() {
    setValue('status', 'none')
    setValue('feedback_requests', null)
  }

  return (
    <div className='bg-elevated group/remove-container relative flex flex-1 flex-col rounded-md border p-3 dark:bg-white/[0.02]'>
      <div className='flex items-center gap-1.5'>
        <FeedbackRequestAltIcon />
        <UIText weight='font-medium' className='flex-1'>
          Request feedback
        </UIText>
        <PostComposerRemoveButton
          disabled={methods.formState.isSubmitting}
          accessibilityLabel='Remove feedback request'
          onClick={handleRemove}
        />
      </div>
      <PostComposerFeedbackManager form={methods} />
    </div>
  )
})
