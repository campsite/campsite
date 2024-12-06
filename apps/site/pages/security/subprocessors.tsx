import { NextSeo } from 'next-seo'

import { SITE_URL } from '@campsite/config'

import { WidthContainer } from '@/components/Layouts/WidthContainer'

import { PageHead } from '../../components/Layouts/PageHead'
import { SubprocessorTable } from '../../components/Security'

export default function SubprocessorsPage() {
  return (
    <>
      <NextSeo
        title='Subprocessors · Campsite'
        description='Authorized subprocessors'
        canonical={`${SITE_URL}/security/subprocessors`}
      />

      <WidthContainer className='flex max-w-5xl flex-col gap-12'>
        <PageHead title='Subprocessors' subtitle='Updated June 1, 2023' />
        <SubprocessorTable />
      </WidthContainer>
    </>
  )
}
