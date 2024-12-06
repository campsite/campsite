'use client'

import Image from 'next/image'

import { SectionText } from '@/components/Home/Manifesto'
import { StartButton } from '@/components/Home/StartButton'
import { PageTitle } from '@/components/Layouts/PageHead'
import { WidthContainer } from '@/components/Layouts/WidthContainer'

export function FooterCTA() {
  return (
    <div className='bg-secondary dark:bg-neutral-950'>
      <WidthContainer className='items-center py-16 text-center lg:py-24'>
        <Image
          src='/img/desktop-app-icon.png'
          width={128}
          height={128}
          alt='Desktop App Icon'
          className='mb-4 w-20 lg:w-24'
        />

        <PageTitle className='text-[clamp(2rem,_5vw,_2.4rem)]' element='h2'>
          Teamwork, meet deep work.
        </PageTitle>
        <SectionText className='text-secondary max-w-3xl text-[clamp(1.2rem,_5vw,_1.4rem)]'>
          Try Campsite today with a free 14-day trial. No credit card required.
        </SectionText>

        <div className='mt-8'>
          <StartButton />
        </div>
      </WidthContainer>
    </div>
  )
}
