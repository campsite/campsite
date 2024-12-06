import { NextSeo } from 'next-seo'

import { SITE_URL } from '@campsite/config'

import { Manifesto } from '@/components/Home/Manifesto'

function IndexPage() {
  return (
    <>
      <NextSeo canonical={SITE_URL} />

      <Manifesto />
    </>
  )
}

export default IndexPage
