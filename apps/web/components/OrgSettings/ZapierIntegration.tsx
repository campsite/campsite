import Image from 'next/image'

import { ZAPIER_APP_URL } from '@campsite/config'
import { Button, Link, UIText } from '@campsite/ui'

import * as SettingsSection from '@/components/SettingsSection'

export function ZapierIntegration() {
  return (
    <SettingsSection.Section>
      <SettingsSection.Header className='p-3'>
        <SettingsSection.Title className='flex-1'>
          <div className='flex w-full items-center gap-3'>
            <Image src='/img/services/zapier-app-icon.png' width='36' height='36' alt='Figma app icon' />
            <div className='flex flex-col'>
              <span className='flex-1'>Zapier</span>
              <UIText tertiary>
                Create posts, comments, and chat messages automatically.{' '}
                <Link
                  className='text-blue-500 hover:underline'
                  href='https://app.campsite.com/campsite/p/notes/connecting-campsite-to-zapier-exr89eu8xins'
                  target='_blank'
                >
                  Learn more
                </Link>
              </UIText>
            </div>
          </div>
        </SettingsSection.Title>

        <Button variant='base' href={ZAPIER_APP_URL} externalLink>
          Create a Zap
        </Button>
      </SettingsSection.Header>
    </SettingsSection.Section>
  )
}
