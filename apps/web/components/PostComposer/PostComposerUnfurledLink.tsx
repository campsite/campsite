import { useFormContext } from 'react-hook-form'

import { PostSchema } from '@/components/Post/schema'
import { PostComposerRemoveButton } from '@/components/PostComposer/PostComposerRemoveButton'
import { RichLinkCard } from '@/components/RichLinkCard'

/**
 * This component allows users to remove the unfurled link on older posts.
 * We got rid of unfurled links when inline attachments were added to posts.
 */
export function PostComposerUnfurledLink() {
  const methods = useFormContext<PostSchema>()
  const unfurledLink = methods.watch('unfurled_link')

  function removeLink() {
    methods.setValue('unfurled_link', null)
  }

  if (!unfurledLink) {
    return null
  }

  return (
    <div className='group/remove-container relative mx-3 max-w-lg'>
      <RichLinkCard url={unfurledLink} interactive={false} onForceRemove={removeLink} />

      <PostComposerRemoveButton
        disabled={methods.formState.isSubmitting}
        accessibilityLabel='Remove link preview'
        onClick={removeLink}
      />
    </div>
  )
}
