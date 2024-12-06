import { useFormContext, useWatch } from 'react-hook-form'
import { useCommand } from 'src/core/command-context'
import { FormSchema } from 'src/core/schema'

import { Button } from '@campsite/ui'

export function SubmitFooter() {
  const {
    formState: { isValid }
  } = useFormContext<FormSchema>()

  return (
    <Button type='submit' className='grow-0' variant='primary' size='large' fullWidth disabled={!isValid}>
      Post
    </Button>
  )
}
