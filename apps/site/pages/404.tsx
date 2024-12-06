import { Button } from '@campsite/ui'

import { PageTitle } from '@/components/Layouts/PageHead'

export default function Page() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center p-6'>
      <PageTitle className='text-quaternary text-[clamp(8rem,20vw,20rem)] font-bold opacity-20'>404</PageTitle>
      <div className='flex items-center gap-3'>
        <Button href='/' size='large' variant='primary'>
          Go back home
        </Button>
        <Button href='/contact' size='large' variant='flat'>
          Contact us
        </Button>
      </div>
    </div>
  )
}
