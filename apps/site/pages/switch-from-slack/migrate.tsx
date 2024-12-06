import { useState } from 'react'
import { NextSeo } from 'next-seo'

import { SITE_URL } from '@campsite/config'

import { MigrateForm } from '@/components/Home/SwitchSlackPathPicker'
import { PageHead } from '@/components/Layouts/PageHead'
import { WidthContainer } from '@/components/Layouts/WidthContainer'

export default function Migrate() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <>
      <NextSeo
        title='Switch from Slack'
        description='Move from Slack to Campsite in minutes.'
        canonical={`${SITE_URL}/switch-from-slack/migrate`}
      />

      <WidthContainer className='max-w-4xl gap-12 py-16 lg:py-24'>
        <PageHead title='Switch from Slack' subtitle='Replace noisy chats with focused, organized posts.' />
        <MigrateForm submitted={submitted} setSubmitted={setSubmitted} />
      </WidthContainer>
    </>
  )
}
