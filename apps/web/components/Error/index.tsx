import { Button } from '@campsite/ui'

import { useScope } from '@/contexts/scope'

interface Props {
  message: string
  title?: string
  emoji?: string
}

export function FullPageError({ message, title = 'Something went wrong', emoji = '📛' }: Props) {
  const { setScope } = useScope()

  /*
    Resetting the scope is a bit aggressive, but is needed in the event that someone
    has landed on a page where they aren't a member of that organization. By default, the scope
    cookie will be set with an invalid org, so if the user tried to reload the app we would
    keep trying to redirect them to an invalid org.

    By clearing the scope, we ensure that the user will land back on the app root and be correctly
    redirected to an org they are a member of.
  */
  function handleReset() {
    setScope(null)
    window.location.href = '/'
  }

  return (
    <div className='flex w-full flex-1 flex-col items-center justify-center gap-6'>
      <div className='group relative h-24 w-20'>
        <div className='bg-primary absolute inset-0 rotate-[5deg] rounded-md border shadow-sm transition-transform group-hover:rotate-[7deg] group-hover:scale-105' />
        <div className='bg-primary absolute inset-0 flex rotate-[-5deg] items-center justify-center rounded-md border shadow-sm transition-transform group-hover:rotate-[-7deg] group-hover:scale-105'>
          <span className='text-2xl'>{emoji}</span>
        </div>
      </div>

      <div className='text-center'>
        <p className='font-semibold'>{title}</p>
        <p className='text-neutral-400'>{message}</p>
      </div>

      <div className='flex gap-2'>
        <Button variant='primary' onClick={handleReset}>
          Back home
        </Button>
        <Button href='mailto:support@campsite.com' externalLink>
          Get help
        </Button>
      </div>
    </div>
  )
}
