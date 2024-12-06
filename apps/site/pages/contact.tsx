import { FormEvent, useState } from 'react'
import { NextSeo } from 'next-seo'

import { SITE_URL } from '@campsite/config'
import { Button, FormError, TextField } from '@campsite/ui'
import { useHasMounted } from '@campsite/ui/src/hooks'

import { PageTitle } from '@/components/Layouts/PageHead'
import { WidthContainer } from '@/components/Layouts/WidthContainer'

import { ContactFormRequestBody } from './api/contact'

export default function ContactPage() {
  return (
    <>
      <NextSeo title='Contact · Campsite' description='Contact us.' canonical={`${SITE_URL}/contact`} />

      <WidthContainer className='max-w-3xl gap-12 py-16 lg:py-24'>
        <PageTitle>Contact us</PageTitle>

        <ContactForm />
      </WidthContainer>
    </>
  )
}

export function ContactForm({
  onSuccess,
  messagePlaceholder = 'What can we help with?'
}: {
  onSuccess?: () => void
  messagePlaceholder?: string
}) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const hasMounted = useHasMounted()
  const [isLoading, setIsLoading] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const { elements } = e.currentTarget
    const name = (elements.namedItem('name') as HTMLInputElement).value
    const email = (elements.namedItem('email') as HTMLInputElement).value
    const message = (elements.namedItem('message') as HTMLInputElement).value
    const companyName = (elements.namedItem('companyName') as HTMLInputElement).value

    const body: ContactFormRequestBody = {
      name,
      email,
      message,
      companyName
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
        onSuccess?.()
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
    <form
      onKeyDownCapture={onKeyDownCapture}
      id='contact-form'
      method='post'
      onSubmit={onSubmit}
      className='flex flex-col gap-5'
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
      {hasMounted && (
        <TextField id='message' placeholder={messagePlaceholder} label='Message' multiline minRows={4} maxRows={8} />
      )}

      <div>
        <Button disabled={submitted || isLoading} type='submit' variant='primary'>
          Submit
        </Button>
      </div>

      {submitted && (
        <p className='border-l-2 border-green-600 pl-2 text-left text-sm text-green-700'>
          Thanks for reaching out! We’ll be in touch soon.
        </p>
      )}

      {error && <FormError>{error}</FormError>}
    </form>
  )
}
