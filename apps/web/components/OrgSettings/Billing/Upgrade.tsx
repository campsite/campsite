import { PropsWithChildren, useState } from 'react'

import { SITE_URL } from '@campsite/config'
import { OrganizationIntegrationsStripeCheckoutSessionsPostRequest } from '@campsite/types'
import { Button, CheckIcon, cn, InformationIcon, Link, ToggleGroup, Tooltip, UIText } from '@campsite/ui'

import * as SettingsSection from '@/components/SettingsSection'
import { useCreateStripeCheckoutSession } from '@/hooks/useCreateStripeCheckoutSession'

export function Upgrade() {
  return (
    <>
      <PlanTable />
      <SettingsSection.Section>
        <div className='flex items-center justify-between gap-4 p-4'>
          <div className='flex flex-1 flex-col'>
            <UIText weight='font-semibold'>Campsite for Business</UIText>
            <UIText secondary>
              Single sign-on, custom SLA, private support channel, and more.{' '}
              <Link target='_blank' rel='noopener noreferrer' href={`${SITE_URL}/pricing`} className='text-blue-500'>
                Learn more
              </Link>
            </UIText>
          </div>
          <Button href='https://cal.com/brianlovin/30min'>Schedule a call</Button>
        </div>

        <div className='flex justify-between border-t p-4'>
          <UIText weight='font-medium' tertiary>
            Questions?
          </UIText>
          <Button variant='text' href='mailto:support@campsite.com?subject=Campsite pricing'>
            Get in touch
          </Button>
        </div>
      </SettingsSection.Section>
    </>
  )
}

function PlanTable() {
  const createStripeCheckoutSession = useCreateStripeCheckoutSession()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual')

  const redirectToCheckout = (price: OrganizationIntegrationsStripeCheckoutSessionsPostRequest['price']) => {
    createStripeCheckoutSession.mutate(
      { price },
      {
        onSuccess: (data) => {
          window.location.replace(data.url)
        }
      }
    )
  }

  const handleUpgradeClick = (plan: 'essentials' | 'pro') => {
    redirectToCheckout(`${plan}_${billingCycle}`)
  }

  return (
    <div className='flex w-full flex-col'>
      <div className='flex flex-1'>
        <ToggleGroup
          ariaLabel='Billing cycle'
          items={[
            { value: 'monthly', label: 'Pay monthly' },
            { value: 'annual', label: 'Pay annually' }
          ]}
          value={billingCycle}
          onValueChange={(value) => {
            if (value) setBillingCycle(value as 'monthly' | 'annual')
          }}
        />
      </div>
      <div className='mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-0'>
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
                <SectionHeading>{billingCycle === 'monthly' ? '$10' : '$8'}</SectionHeading>
                {billingCycle === 'annual' && <DiscountLabel>–20%</DiscountLabel>}
              </div>

              <UIText quaternary>per member/month</UIText>
            </div>

            <div>
              <Button variant='brand' size='large' fullWidth onClick={() => handleUpgradeClick('essentials')}>
                Upgrade
              </Button>
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
        <PlanContainer className='lg:-mx-px lg:rounded-l-none lg:border lg:border-l-0'>
          <UIText weight='font-semibold' className='uppercase tracking-wide'>
            Pro
          </UIText>

          <div className='flex flex-col gap-1'>
            <div className='flex gap-2'>
              <SectionHeading>{billingCycle === 'monthly' ? '$20' : '$16'}</SectionHeading>
              {billingCycle === 'annual' && <DiscountLabel>–20%</DiscountLabel>}
            </div>
            <UIText quaternary>per member/month</UIText>
          </div>

          <div>
            <Button variant='primary' size='large' fullWidth onClick={() => handleUpgradeClick('pro')}>
              Upgrade
            </Button>
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

function PlanText({ children, className }: PropsWithChildren & { className?: string }) {
  return <p className={cn('text-tertiary text-balance text-[clamp(0.875rem,_2vw,_1rem)]', className)}>{children}</p>
}

function DiscountLabel({ children }: PropsWithChildren) {
  return (
    <span className='self-center rounded-md bg-blue-500 px-2 py-1 text-xs font-semibold text-white'>{children}</span>
  )
}

function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3
      className={cn(
        'scroll-mt-20 text-balance text-[clamp(1.5rem,_3vw,_1.8rem)] font-semibold leading-[1.2] -tracking-[0.5px]',
        className
      )}
    >
      {children}
    </h3>
  )
}
