import { Font } from 'next/dist/compiled/@vercel/og/satori'
import { ImageResponse } from 'next/og'

import { DEFAULT_SEO, SITE_URL } from '@campsite/config'

import { OG_IMAGE_SIZE } from '@/lib/og'

async function getFonts(): Promise<Font[]> {
  const [interRegular, interMedium, interSemiBold] = await Promise.all([
    fetch(new URL(`${SITE_URL}/og/fonts/Inter-Regular.ttf`)).then((res) => res.arrayBuffer()),
    fetch(new URL(`${SITE_URL}/og/fonts/Inter-Medium.ttf`)).then((res) => res.arrayBuffer()),
    fetch(new URL(`${SITE_URL}/og/fonts/Inter-SemiBold.ttf`)).then((res) => res.arrayBuffer())
  ])

  return [
    {
      name: 'Inter',
      data: interRegular,
      style: 'normal',
      weight: 400
    },
    {
      name: 'Inter',
      data: interMedium,
      style: 'normal',
      weight: 500
    },
    {
      name: 'Inter',
      data: interSemiBold,
      style: 'normal',
      weight: 600
    }
  ]
}

export async function GET(request: Request) {
  let url = new URL(request.url)
  let title = url.searchParams.get('title') || DEFAULT_SEO.title

  return new ImageResponse(
    (
      <div
        style={{
          padding: '88px 256px 88px 88px',
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end'
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${SITE_URL}/og/og-image-app-icon.png`}
          height='100px'
          width='100px'
          alt='Campsite logo'
          style={{ marginBottom: '52px' }}
        />

        <p style={{ fontSize: '52px', fontWeight: '600', lineHeight: '62px', letterSpacing: '-0.015em' }}>{title}</p>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts: await getFonts()
    }
  )
}
