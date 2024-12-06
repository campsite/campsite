import { NextSeo } from 'next-seo'

import { SITE_URL } from '@campsite/config'

import { CustomerLogos } from '@/components/Home/CustomerLogos'
import { PageHead } from '@/components/Layouts/PageHead'
import { WidthContainer } from '@/components/Layouts/WidthContainer'

import { FAQ } from '../components/Pricing/FAQ'
import { PlanTable } from '../components/Pricing/PlanTable'

export default function PricingPage() {
  return (
    <>
      <NextSeo
        title='Pricing · Campsite'
        description='Free 14-day trial, then one simple price for every team'
        canonical={`${SITE_URL}/pricing`}
      />

      <WidthContainer className='3xl:pt-32 4xl:pt-36 items-center gap-4 pt-12 md:pt-16 lg:pt-20 xl:pt-24 2xl:pt-28'>
        <PageHead title='Simple pricing for every team' subtitle='Free 14-day trial, no credit card required' />
        <CustomerLogos />
      </WidthContainer>

      <PlanTable />

      <WidthContainer className='3xl:py-32 4xl:py-36 max-w-2xl py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-28'>
        <FAQ />
      </WidthContainer>
    </>
  )
}
