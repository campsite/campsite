import { memo } from 'react'
import { useFormContext } from 'react-hook-form'
import { v4 as uuid } from 'uuid'

import { POLL_OPTION_DESCRIPTION_LENGTH } from '@campsite/config'
import { Button, ButtonPlusIcon, TextField, TrashIcon, UIText, UnorderedListIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { PostSchema } from '../Post/schema'
import { useFormSetValue } from './hooks/useFormSetValue'
import { PostComposerRemoveButton } from './PostComposerRemoveButton'

export function getBlankPollOption() {
  return { id: uuid(), description: '', new: true }
}

export const PostComposerPolls = memo(function PostComposerPolls() {
  const methods = useFormContext<PostSchema>()
  const setValue = useFormSetValue<PostSchema>()
  const poll = methods.watch('poll')

  function getOptionPlaceholder(index: number) {
    switch (index) {
      case 0:
        return 'First option'
      case 1:
        return 'Second option'
      case 2:
        return 'Third option'
      case 3:
        return 'Fourth option'
      default:
        return 'Option'
    }
  }

  function handleOptionChange({ id, description }: { id: string; description: string }) {
    if (description.length > POLL_OPTION_DESCRIPTION_LENGTH) return
    if (!poll) return

    setValue(
      'poll.options',
      poll.options.map((option) => {
        if (option.id === id) return { ...option, description }
        return option
      })
    )
  }

  function removeOption(id: string) {
    if (!poll) return
    setValue(
      'poll.options',
      poll.options.filter((option) => option.id !== id)
    )
  }

  function addOption() {
    if (!poll) return
    setValue('poll.options', [...poll.options, getBlankPollOption()])
  }

  function handleRemove() {
    setValue('poll', null)
  }

  return (
    <div className='group/remove-container relative flex flex-1 flex-col gap-2 rounded-md border p-3 dark:bg-white/[0.02]'>
      <div className='flex items-center gap-1.5'>
        <UnorderedListIcon />
        <UIText weight='font-medium' className='flex-1'>
          {poll?.id ? 'Edit' : 'Add'} poll
        </UIText>
        <PostComposerRemoveButton
          disabled={methods.formState.isSubmitting}
          accessibilityLabel='Remove feedback request'
          onClick={handleRemove}
        />
      </div>
      <div className='flex flex-col gap-1.5'>
        {poll?.options.map((option, i) => (
          <div className='flex items-center gap-2' key={option.id}>
            <div className='relative flex-1'>
              <TextField
                additionalClasses='bg-tertiary'
                onChange={(val) => handleOptionChange({ id: option.id, description: val })}
                placeholder={getOptionPlaceholder(i)}
                value={option.description}
                autoComplete='off'
                autoFocus={i === 0}
              />
              <div
                className={cn('absolute right-3 top-1/2 -translate-y-1/2', {
                  'text-primary opacity-40': option.description.length < POLL_OPTION_DESCRIPTION_LENGTH,
                  'text-red-500': option.description.length === POLL_OPTION_DESCRIPTION_LENGTH
                })}
              >
                <UIText inherit size='text-xs' tertiary>
                  {option.description.length}/{POLL_OPTION_DESCRIPTION_LENGTH.toString()}
                </UIText>
              </div>
            </div>
            {poll?.options.length > 2 && (
              <Button
                type='button'
                variant='plain'
                iconOnly={<TrashIcon />}
                accessibilityLabel='Remove option'
                onClick={() => removeOption(option.id)}
              />
            )}
          </div>
        ))}
      </div>
      {poll && poll.options.length < 4 && (
        <div className='-mb-1 flex items-center justify-center'>
          <Button type='button' variant='plain' leftSlot={<ButtonPlusIcon />} onClick={addOption}>
            Add option
          </Button>
        </div>
      )}
    </div>
  )
})
