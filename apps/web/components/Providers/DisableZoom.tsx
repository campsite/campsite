import Head from 'next/head'
import { isMobile } from 'react-device-detect'

import { useIsDesktopApp } from '@campsite/ui/src/hooks'

export function DisableZoom() {
  const isDesktop = useIsDesktopApp()

  return (
    <Head>
      {(isMobile || isDesktop) && (
        <meta
          name='viewport'
          content='width=device-width,height=device-height,initial-scale=1,maximum-scale=1,user-scalable=no,shrink-to-fit=no,viewport-fit=cover'
        />
      )}
    </Head>
  )
}
