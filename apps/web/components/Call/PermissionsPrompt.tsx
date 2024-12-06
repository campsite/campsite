import { ReactNode } from 'react'

import { UIText } from '@campsite/ui'

interface Props {
  title: string
  description: ReactNode
}

export function PermissionsPrompt({ title, description }: Props) {
  return (
    <div className='flex max-h-[--radix-popper-available-height] flex-col p-3'>
      <div className='flex flex-col gap-1.5'>
        <UIText weight='font-medium'>{title}</UIText>
        <UIText secondary>{description}</UIText>
      </div>
    </div>
  )
}
