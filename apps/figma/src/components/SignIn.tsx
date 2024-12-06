import { api } from 'src/api'

import { Button, Caption, Title1, UIText } from '@campsite/ui'

export function SignIn() {
  const { mutate: signIn } = api.auth.useSignInMutation()

  return (
    <div className='flex flex-1 flex-col items-start justify-center gap-6 px-8 py-4'>
      <div className='w-8'>
        <svg viewBox='0 0 49 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M0.201982 21.9532L13.7942 0.654571C14.0531 0.248924 14.5245 0 15.0338 0H37.1765C38.2907 0 38.9824 1.12038 38.4161 2.00776L24.8238 23.3064C24.565 23.7121 24.0936 23.961 23.5843 23.961H1.44157C0.327401 23.961 -0.364321 22.8406 0.201982 21.9532Z'
            fill='currentColor'
          />
          <path
            d='M32.0309 23.9609H47.4978C48.5832 23.9609 49.2781 22.8922 48.7691 22.0055L41.4653 9.28149C40.9386 8.36398 39.5292 8.33304 38.9561 9.22642L30.793 21.9505C30.2237 22.8378 30.9152 23.9609 32.0309 23.9609Z'
            fill='currentColor'
          />
        </svg>
      </div>

      <div className='flex flex-col gap-1'>
        <Title1 weight='font-semibold'>Sign in</Title1>
        <Caption weight='font-normal'>
          New to Campsite?{' '}
          <button className='inline-flex' onClick={() => signIn()}>
            <UIText className='!text-blue-500' element='span' size='text-inherit' weight='font-medium'>
              Sign up
            </UIText>
          </button>
        </Caption>
      </div>

      <div className='w-full'>
        <Button fullWidth size='large' variant='primary' onClick={() => signIn()}>
          Sign in
        </Button>
      </div>
    </div>
  )
}
