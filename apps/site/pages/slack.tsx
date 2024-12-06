import { NextSeo } from 'next-seo'
import Image from 'next/image'

import { SITE_URL } from '@campsite/config'

import { PageHead } from '@/components/Layouts/PageHead'
import { WidthContainer } from '@/components/Layouts/WidthContainer'

export default function Support() {
  return (
    <>
      <NextSeo
        title='Slack · Campsite'
        description='How to use Campsite’s integration for Slack'
        canonical={`${SITE_URL}/slack`}
      />

      <WidthContainer className='max-w-3xl gap-12 py-16 lg:py-24'>
        <PageHead title='Campsite + Slack' subtitle='How to use Campsite’s integration for Slack' />

        <div className='prose lg:prose-lg flex-1'>
          <div>
            <p>
              Campsite’s integration for Slack makes it easy for your team to see when new work is being shared. Think
              of this like push notifications for your team’s work-in-progress — when someone publishes a post, Campsite
              will push that update to a Slack channel of your choice to improve visibility and give people a quick link
              to view the content on Campsite.
            </p>
            <h2 className='text-2xl font-semibold'>Connecting to Slack</h2>
            <p>
              Navigate to your campsite’s settings, and look for the Connect Slack button under the integrations
              heading:
            </p>
            <Image src='/img/slack/slack-1.png' width={2000} height={1184} alt='Connecting to Slack' />

            <p>
              <strong>Channel-specific broadcasts</strong> — a <em>second</em> broadcast can be optionally sent to a
              separate Slack channel when a post is uploaded to a <em>specific</em> Campsite channel.
            </p>

            <Image src='/img/slack/slack-2.png' width={2000} height={555} alt='Slack broadcasts for channels' />
            <p>
              Many teams configure this so that all posts are broadcast to a central #design-wip or #show-and-tell
              channel, while channel-specific broadcasts go to working group channels to provide visibility for
              engineers, PMs, and other cross-functional peers.
            </p>
          </div>
        </div>
      </WidthContainer>
    </>
  )
}
