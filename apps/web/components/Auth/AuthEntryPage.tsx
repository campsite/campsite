import Head from 'next/head'
import { useRouter } from 'next/router'

import { Button, Logo, UIText } from '@campsite/ui'
import { Link } from '@campsite/ui/Link'

interface Props {
  title: string
  actionHref: string
  actionLabel: string
  description?: string
  switchHref: string
  switchLabel: string
  switchPrompt: string
  footer?: React.ReactNode
}

export function AuthEntryPage({
  actionHref,
  actionLabel,
  description,
  footer,
  switchHref,
  switchLabel,
  switchPrompt,
  title
}: Props) {
  const router = useRouter()
  const queryString = router.asPath.includes('?') ? router.asPath.slice(router.asPath.indexOf('?')) : ''
  const actionTarget = `${actionHref}${queryString}`
  const switchTarget = `${switchHref}${queryString}`

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <main className='bg-primary flex min-h-screen flex-col justify-center p-4'>
        <div className='mx-auto flex w-full max-w-md flex-col items-center'>
          <div className='text-primary flex w-full flex-col space-y-2'>
            <Logo className='h-5 w-auto' />

            <h1 className='text-primary flex w-full justify-start pt-8 text-xl font-bold md:text-2xl'>{title}</h1>

            <span className='w-full text-sm text-tertiary'>
              {switchPrompt}
              {' '}
              <Link className='font-medium text-link hover:underline' href={switchTarget}>
                {switchLabel}
              </Link>
            </span>
          </div>

          <div className='mt-8 w-full space-y-5'>
            {description ? (
              <UIText secondary className='text-sm leading-6'>
                {description}
              </UIText>
            ) : null}

            <Button fullWidth size='large' variant='primary' onClick={() => window.location.assign(actionTarget)}>
              {actionLabel}
            </Button>

            {footer ? <div className='text-sm text-tertiary'>{footer}</div> : null}
          </div>
        </div>
      </main>
    </>
  )
}
