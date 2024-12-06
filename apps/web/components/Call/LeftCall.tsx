import { Button, UIText } from '@campsite/ui'

export function LeftCall() {
  return (
    <div className='flex h-full items-center justify-center'>
      <div className='flex flex-col items-center justify-center gap-3'>
        <UIText weight='font-medium' quaternary>
          You have left the call.
        </UIText>
        <div>
          <Button href='/' variant='flat' fullWidth>
            Return to Campsite
          </Button>
        </div>
      </div>
    </div>
  )
}
