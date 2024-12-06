import { UIText } from '@campsite/ui'

interface Props {
  message?: string
  title?: string
  emoji?: string | null
  icon?: React.ReactNode | null
  children?: React.ReactNode
}

export function EmptyState({ message = '', title = '', emoji = null, icon = null, children }: Props) {
  return (
    <div className='flex flex-1 items-center justify-center'>
      <div className='flex flex-col items-center justify-center text-center'>
        {emoji && (
          <UIText size='text-xl' weight='font-semibold' className='mb-4'>
            {emoji}
          </UIText>
        )}

        {icon && <div className='text-primary mb-4 p-2 text-opacity-80'>{icon}</div>}

        {(title || message) && (
          <div className='flex flex-col gap-2'>
            {title && (
              <UIText weight='font-medium' primary>
                {title}
              </UIText>
            )}

            {message && <UIText tertiary>{message}</UIText>}
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
