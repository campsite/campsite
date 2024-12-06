import { PropsWithChildren, useState } from 'react'

import { Button, CheckIcon, cn, InformationIcon, Tooltip, UIText } from '@campsite/ui'

import { SectionHeading } from '@/components/Home/Manifesto'
import { StartButton } from '@/components/Home/StartButton'
import { SegmentedControl } from '@/components/SegmentedControl'

function PlanText({ children, className }: PropsWithChildren & { className?: string }) {
  return <p className={cn('text-tertiary text-balance text-[clamp(0.875rem,_2vw,_1rem)]', className)}>{children}</p>
}

export function PlanTable() {
  const [duration, setDuration] = useState('yearly')

  return (
    <div className='mx-auto mt-4 flex w-full max-w-6xl flex-col px-4 lg:mt-8'>
      <div className='self-center'>
        <SegmentedControl
          options={[
            { label: 'Pay monthly', value: 'monthly' },
            { label: 'Pay yearly', value: 'yearly' }
          ]}
          activePage={duration}
          setActivePage={setDuration}
        />
      </div>
      <div className='mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-0'>
        <PlanContainer className='bg-elevated relative z-10 gap-0 overflow-hidden border p-0 shadow-sm lg:-mb-4 lg:-mt-8 lg:gap-0 lg:p-0 2xl:pb-0 dark:border-transparent dark:bg-neutral-800 dark:shadow-[inset_0px_0px_0.5px_rgb(255_255_255_/_0.6)]'>
          <div className='bg-secondary text-secondary dark:bg-gray-750 rounded-t-[11px] border-b bg-black p-1.5 text-center dark:border-gray-700'>
            <UIText weight='font-medium' size='text-[13px]'>
              Start here and scale up
            </UIText>
          </div>

          <div className='flex h-full flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-5'>
            <UIText weight='font-semibold' className='text-brand-primary uppercase tracking-wide'>
              Essentials
            </UIText>

            <div className='flex flex-col gap-1'>
              <div className='flex gap-2'>
                <SectionHeading>{duration === 'monthly' ? '$10' : '$8'}</SectionHeading>
                {duration === 'yearly' && <DiscountLabel>–20%</DiscountLabel>}
              </div>

              <UIText quaternary>per member/month</UIText>
            </div>

            <div>
              <StartButton rightSlot={null} />
            </div>

            <ul className='flex-1'>
              <FeatureItem>Unlimited posts</FeatureItem>
              <FeatureItem>Unlimited direct messages</FeatureItem>
              <FeatureItem tooltip='Connect all of your tools and workflows with Campsite’s API'>
                Unlimited integrations
              </FeatureItem>
              <FeatureItem tooltip='Calls can’t be recorded to create transcriptions and smart summaries'>
                Basic audio + video calls
              </FeatureItem>
              <FeatureItem>Up to 10 guests</FeatureItem>
            </ul>
          </div>
        </PlanContainer>
        <PlanContainer className='lg:-mx-px lg:rounded-none lg:border-b lg:border-t'>
          <UIText weight='font-semibold' className='uppercase tracking-wide'>
            Pro
          </UIText>

          <div className='flex flex-col gap-1'>
            <div className='flex gap-2'>
              <SectionHeading>{duration === 'monthly' ? '$20' : '$16'}</SectionHeading>
              {duration === 'yearly' && <DiscountLabel>–20%</DiscountLabel>}
            </div>
            <UIText quaternary>per member/month</UIText>
          </div>

          <div>
            <StartButton variant='primary' rightSlot={null} />
          </div>

          <ul className='flex-1'>
            <FeatureItem>Essentials, plus...</FeatureItem>
            <FeatureItem tooltip='Record your calls for searchable transcriptions and shareable summaries'>
              Record and auto-summarize calls
            </FeatureItem>
            <FeatureItem tooltip='Automatically summarize and resolve long conversations to stay in the loop'>
              Post summaries + resolutions
            </FeatureItem>
            <FeatureItem>Unlimited guests</FeatureItem>
          </ul>
        </PlanContainer>

        <PlanContainer className='lg:rounded-l-none lg:border'>
          <UIText weight='font-semibold' className='uppercase tracking-wide'>
            Business
          </UIText>

          <div className='flex flex-col gap-1'>
            <SectionHeading>Custom pricing</SectionHeading>

            <UIText quaternary className='invisible'>
              for teams with advanced needs
            </UIText>
          </div>

          <Button href='/contact' variant='flat' size='large'>
            Get in touch
          </Button>

          <ul className='flex-1'>
            <FeatureItem>Pro, plus...</FeatureItem>
            <FeatureItem>SSO</FeatureItem>
            <FeatureItem>Custom SLA and MSA</FeatureItem>
            <FeatureItem>Private support channel</FeatureItem>
            <FeatureItem>Migration support</FeatureItem>
          </ul>
        </PlanContainer>
      </div>
    </div>
  )
}

function PlanContainer({ children, className }: PropsWithChildren & { className?: string }) {
  return (
    <div
      className={cn(
        'dark:bg-elevated bg-tertiary flex flex-1 flex-col gap-4 rounded-xl p-4 lg:gap-6 lg:p-5 2xl:pb-6 dark:shadow-[inset_0px_0px_0px_0.5px_rgb(255_255_255_/_0.06),_0px_1px_2px_rgb(0_0_0_/_0.4),_0px_2px_4px_rgb(0_0_0_/_0.08),_0px_0px_0px_0.5px_rgb(0_0_0_/_0.24)]',
        className
      )}
    >
      {children}
    </div>
  )
}

function FeatureItem({ children, tooltip }: PropsWithChildren & { tooltip?: string }) {
  return (
    <li className='flex items-start gap-3 py-1.5'>
      <CheckIcon strokeWidth='2' size={20} className='text-tertiary translate-y-0.5' />
      <PlanText className='text-primary'>{children}</PlanText>
      {tooltip && (
        <Tooltip delayDuration={0} label={tooltip}>
          <span className='text-quaternary hover:text-primary hidden translate-y-0.5 lg:flex'>
            <InformationIcon />
          </span>
        </Tooltip>
      )}
    </li>
  )
}

function DiscountLabel({ children }: PropsWithChildren) {
  return (
    <span className='self-center rounded-md bg-blue-500 px-2 py-1 text-xs font-semibold text-white'>{children}</span>
  )
}
