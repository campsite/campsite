import { FormEvent, useState } from 'react'
import * as RadioGroup from '@radix-ui/react-radio-group'

import {
  Button,
  Checkbox,
  CheckCircleFilledFlushIcon,
  cn,
  Dialog,
  FormError,
  PlusIcon,
  RefreshIcon,
  SparklesIcon,
  SwitchIcon,
  TextField,
  UIText,
  useBreakpoint,
  useHasMounted,
  UsersIcon
} from '@campsite/ui'

import { ContactFormRequestBody } from '@/pages/api/contact'

type Level = 'fresh' | 'migrate'

export function SwitchSlackPathPicker() {
  const [level, setLevel] = useState<Level>('fresh')
  const hasMounted = useHasMounted()
  const [dialogOpen, setDialogOpen] = useState(false)
  const isMd = useBreakpoint('md')

  return (
    <div className='w-full'>
      <div className='bg-elevated dark:bg-secondary mx-auto w-auto rounded-t-xl border border-b-0 p-2 uppercase shadow-sm'>
        <UIText tertiary size='text-xs' className='tracking-wide'>
          Choose your path
        </UIText>
      </div>
      <RadioGroup.Root
        className='bg-elevated relative w-full overflow-hidden rounded-xl rounded-t-none border shadow'
        defaultValue={level}
        aria-label='View density'
        onValueChange={(level: Level) => setLevel(level)}
      >
        <div className='grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0'>
          <Item level='fresh' active={level === 'fresh'}>
            <div className='grid grid-rows-[1fr,32px]'>
              <div className='grid grid-cols-[32px,1fr] gap-3'>
                <div className='dark:bg-gray-750 flex h-6 w-6 flex-none items-center justify-center rounded-full border p-1 shadow-sm'>
                  {level === 'fresh' && <div className='h-4 w-4 flex-none rounded-full bg-blue-500' />}
                </div>

                <div>
                  <UIText size='text-base' weight='font-medium'>
                    Start fresh
                  </UIText>
                  <UIText secondary className='mt-1' size='text-base'>
                    Like a cool glass of water after wandering through the desert.
                  </UIText>
                  <ul className='flex flex-col gap-3 py-4'>
                    <li className='flex items-start gap-2'>
                      <UsersIcon className='opacity-50' size={24} />
                      <UIText size='text-base'>We’ll help invite your team</UIText>
                    </li>
                    <li className='flex items-start gap-2'>
                      <PlusIcon className='opacity-50' size={24} />
                      <UIText size='text-base'>Create new channels as needed</UIText>
                    </li>
                    <li className='flex items-start gap-2'>
                      <SparklesIcon className='opacity-50' size={24} />
                      <UIText size='text-base'>Up and running in seconds</UIText>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='grid grid-cols-[32px,1fr] gap-3'>
                {level === 'fresh' && (
                  <Button href='/start' variant='primary' fullWidth className='col-start-2'>
                    Start fresh
                  </Button>
                )}
              </div>
            </div>
          </Item>
          <Item level='migrate' active={level === 'migrate'}>
            <div className='grid grid-rows-[1fr,32px]'>
              <div className='grid grid-cols-[32px,1fr] gap-3'>
                <div className='bg-elevated dark:bg-gray-750 flex h-6 w-6 flex-none items-center justify-center rounded-full border p-1 shadow-sm'>
                  {level === 'migrate' && <div className='h-4 w-4 flex-none rounded-full bg-blue-500' />}
                </div>

                <div>
                  <UIText size='text-base' weight='font-medium'>
                    Move my stuff
                  </UIText>
                  <UIText secondary className='mt-1' size='text-base'>
                    Hit the ground running so your team doesn’t miss a beat.
                  </UIText>
                  <ul className='flex flex-col gap-3 py-4'>
                    <li className='flex items-start gap-2'>
                      <UsersIcon className='opacity-50' size={24} />
                      <UIText size='text-base'>We’ll help invite your team</UIText>
                    </li>
                    <li className='flex items-start gap-2'>
                      <RefreshIcon className='opacity-50' size={24} />
                      <UIText size='text-base'>Choose channels to move</UIText>
                    </li>
                    <li className='flex items-start gap-2'>
                      <SwitchIcon className='opacity-50' size={24} />
                      <UIText size='text-base'>Migrate important conversations</UIText>
                    </li>
                  </ul>
                </div>
              </div>
              <div className='grid grid-cols-[32px,1fr] gap-3'>
                {level === 'migrate' && (
                  <>
                    <Button
                      onClick={() => {
                        if (isMd) setDialogOpen(true)
                      }}
                      href={isMd ? undefined : '/switch-from-slack/migrate'}
                      variant='primary'
                      fullWidth
                      className='col-start-2'
                    >
                      Continue
                    </Button>
                    {hasMounted && <MigrateDialog open={dialogOpen} onOpenChange={setDialogOpen} />}
                  </>
                )}
              </div>
            </div>
          </Item>
        </div>
      </RadioGroup.Root>
    </div>
  )
}

function Item({ level, children, active }: { level: Level; children: React.ReactNode; active: boolean }) {
  return (
    <div className='flex flex-col text-left'>
      <RadioGroup.Item value={level} id={level} />
      <label
        className={cn('flex h-full w-full cursor-pointer flex-col', {
          'bg-elevated dark:bg-tertiary': active,
          'bg-tertiary dark:bg-secondary opacity-70': !active
        })}
        htmlFor={level}
      >
        <div className='flex flex-1 flex-col p-6'>{children}</div>
      </label>
    </div>
  )
}

type SlackFeature =
  | 'channels'
  | 'threads'
  | 'files'
  | 'messages'
  | 'users'
  | 'reactions'
  | 'guests'
  | 'integrations'
  | 'connect'
  | 'other'

export function MigrateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [submitted, setSubmitted] = useState(false)

  return (
    <Dialog.Root align='top' open={open} onOpenChange={onOpenChange} size='xl'>
      {!submitted && (
        <Dialog.Header>
          <Dialog.Title>Move your stuff from Slack</Dialog.Title>
        </Dialog.Header>
      )}
      <Dialog.Content
        className={cn('flex flex-col items-center justify-center gap-4', {
          'pt-4': submitted
        })}
      >
        <MigrateForm submitted={submitted} setSubmitted={setSubmitted} />
      </Dialog.Content>
    </Dialog.Root>
  )
}

export function MigrateForm({
  submitted,
  setSubmitted
}: {
  submitted: boolean
  setSubmitted: (submitted: boolean) => void
}) {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [features, setFeatures] = useState<SlackFeature[]>([])

  const featureOptions: { value: SlackFeature; label: string }[] = [
    { value: 'channels', label: 'Channels' },
    { value: 'threads', label: 'Threads' },
    { value: 'files', label: 'Files' },
    { value: 'messages', label: 'Messages' },
    { value: 'users', label: 'People' },
    { value: 'guests', label: 'Guests' },
    { value: 'reactions', label: 'Custom reactions' },
    { value: 'integrations', label: 'Bots/integrations' },
    { value: 'connect', label: 'Slack Connect channels' },
    { value: 'other', label: 'Other' }
  ]

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const { elements } = e.currentTarget
    const name = (elements.namedItem('name') as HTMLInputElement).value
    const email = (elements.namedItem('email') as HTMLInputElement).value
    const companyName = (elements.namedItem('companyName') as HTMLInputElement).value
    const message = `Features needed: ${features.join(', ')}`

    const body: ContactFormRequestBody = {
      name,
      email,
      companyName,
      message,
      subjectPrefix: 'Slack Migration:'
    }

    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then((res) => {
      setIsLoading(false)
      if (res.ok) {
        setSubmitted(true)

        const form = document.getElementById('contact-form') as HTMLFormElement

        form.reset()
      } else {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  function onKeyDownCapture(evt: React.KeyboardEvent) {
    if ((evt.metaKey || evt.ctrlKey) && evt.key === 'Enter') {
      const form = document.getElementById('contact-form') as HTMLFormElement

      form.requestSubmit()
    }
  }

  return (
    <>
      {!submitted && (
        <form
          onKeyDownCapture={onKeyDownCapture}
          id='contact-form'
          method='post'
          onSubmit={onSubmit}
          className='flex w-full flex-col gap-5'
        >
          <TextField id='name' required placeholder='Your name' label='Your name' autoComplete='name' />
          <div className='grid gap-5 lg:grid-cols-2'>
            <TextField
              id='email'
              type='email'
              required
              placeholder='you@acme.com'
              label='Work email'
              autoComplete='email'
            />
            <TextField
              id='companyName'
              required
              placeholder='Acme, Inc.'
              label='Company name'
              autoComplete='organization'
            />
          </div>

          <div className='bg-tertiary grid grid-cols-2 gap-4 rounded-xl p-4'>
            <UIText className='col-span-2'>What do you need to bring over from Slack?</UIText>
            {featureOptions.map((feature) => (
              <label key={feature.value} className='col-span-1 flex items-start space-x-3'>
                <Checkbox
                  id={feature.value}
                  className='col-span-1'
                  checked={features.includes(feature.value)}
                  onChange={(checked) => {
                    setFeatures((prev) =>
                      checked ? [...prev, feature.value] : prev.filter((f) => f !== feature.value)
                    )
                  }}
                />
                <UIText>{feature.label}</UIText>
              </label>
            ))}
          </div>

          <div className='flex justify-end'>
            <Button disabled={submitted || isLoading} type='submit' variant='primary'>
              Submit
            </Button>
          </div>

          {error && <FormError>{error}</FormError>}
        </form>
      )}
      {submitted && (
        <div className='flex flex-col items-center justify-center gap-6 p-12'>
          <CheckCircleFilledFlushIcon size={72} className='text-green-500' />
          <UIText size='text-base' className='text-balance text-center'>
            We’re putting the finishing touches on our Slack migration assistant, we’ll be in touch soon.
          </UIText>
          <Button size='large' variant='primary' href='/start'>
            Try Campsite while you wait
          </Button>
        </div>
      )}
    </>
  )
}
