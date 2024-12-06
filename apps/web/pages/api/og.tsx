/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import { ImageResponse } from '@vercel/og'

import { DEFAULT_SEO } from '@campsite/config'

export const config = {
  runtime: 'edge'
}

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url)

  const title = searchParams.get('title') || DEFAULT_SEO.title
  const org = searchParams.get('org') || 'Campsite'
  const orgAvatar =
    searchParams.get('orgAvatar') ||
    'https://campsite.imgix.net/o/cl3gijjgd001/a/99693eed-1e95-47ff-b68a-42e298182f40.png?fit=crop&h=56&w=56'

  const [medium, bold] = await Promise.all([
    await fetch(new URL('../../assets/Inter-Medium.ttf', import.meta.url)).then((res) => res.arrayBuffer()),
    await fetch(new URL('../../assets/Inter-Bold.ttf', import.meta.url)).then((res) => res.arrayBuffer())
  ])

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          backgroundColor: 'white'
        }}
      >
        <BackgroundSVG />
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            padding: '64px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              fontSize: 32,
              fontFamily: '"Inter-Medium"',
              lineHeight: '56px',
              color: 'black'
            }}
          >
            <img
              src={orgAvatar}
              width='56'
              height='56'
              style={{
                borderRadius: '8px',
                marginRight: '20px'
              }}
            />
            <strong>{org}</strong>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 56,
              fontFamily: '"Inter-Bold"',
              color: 'black',
              lineHeight: '1.2em',
              maxHeight: '3.6em',
              overflow: 'hidden',
              marginTop: '32px'
            }}
          >
            <strong>{title}</strong>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter-Medium',
          data: medium,
          style: 'normal'
        },
        {
          name: 'Inter-Bold',
          data: bold,
          style: 'normal'
        }
      ]
    }
  )
}

function BackgroundSVG() {
  return (
    <svg
      style={{ position: 'absolute', width: '100%', height: '100%' }}
      viewBox='0 0 1012 526'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g clip-path='url(#clip0_5198_1351)'>
        <rect width='1012' height='526' fill='white' style={{ fill: 'white', fillOpacity: 1 }} />
        <g clip-path='url(#clip1_5198_1351)'>
          <rect
            width='1267'
            height='1267'
            transform='translate(378 -27)'
            fill='white'
            style={{ fill: 'white', fillOpacity: 1 }}
          />
          <g opacity='0.2' filter='url(#filter0_dddddd_5198_1351)'>
            <rect
              x='469.361'
              y='3.1748'
              width='1083.65'
              height='1083.65'
              rx='541.825'
              fill='white'
              style={{ fill: 'white', fillOpacity: 1 }}
            />
          </g>
          <g opacity='0.4' filter='url(#filter1_dddddd_5198_1351)'>
            <rect
              x='583.43'
              y='117.243'
              width='855.513'
              height='855.513'
              rx='427.757'
              fill='white'
              style={{ fill: 'white', fillOpacity: 1 }}
            />
          </g>
          <g opacity='0.6' filter='url(#filter2_dddddd_5198_1351)'>
            <rect
              x='697.498'
              y='231.312'
              width='627.376'
              height='627.376'
              rx='313.688'
              fill='white'
              style={{ fill: 'white', fillOpacity: 1 }}
            />
          </g>
          <g opacity='0.8' filter='url(#filter3_dddddd_5198_1351)'>
            <rect
              x='811.566'
              y='345.38'
              width='399.24'
              height='399.24'
              rx='199.62'
              fill='white'
              style={{ fill: 'white', fillOpacity: 1 }}
            />
          </g>
        </g>
      </g>
      <defs>
        <filter
          id='filter0_dddddd_5198_1351'
          x='378.107'
          y='-26.483'
          width='1266.16'
          height='1266.16'
          filterUnits='userSpaceOnUse'
          color-interpolation-filters='sRGB'
        >
          <feFlood flood-opacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='1.70455' />
          <feGaussianBlur stdDeviation='1.26263' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0196802 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='4.09626' />
          <feGaussianBlur stdDeviation='3.03427' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0282725 0' />
          <feBlend mode='normal' in2='effect1_dropShadow_5198_1351' result='effect2_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='7.71289' />
          <feGaussianBlur stdDeviation='5.71326' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.035 0' />
          <feBlend mode='normal' in2='effect2_dropShadow_5198_1351' result='effect3_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='13.7585' />
          <feGaussianBlur stdDeviation='10.1915' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0417275 0' />
          <feBlend mode='normal' in2='effect3_dropShadow_5198_1351' result='effect4_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='25.7337' />
          <feGaussianBlur stdDeviation='19.062' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0503198 0' />
          <feBlend mode='normal' in2='effect4_dropShadow_5198_1351' result='effect5_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='61.597' />
          <feGaussianBlur stdDeviation='45.6274' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0' />
          <feBlend mode='normal' in2='effect5_dropShadow_5198_1351' result='effect6_dropShadow_5198_1351' />
          <feBlend mode='normal' in='SourceGraphic' in2='effect6_dropShadow_5198_1351' result='shape' />
        </filter>
        <filter
          id='filter1_dddddd_5198_1351'
          x='492.175'
          y='87.5854'
          width='1038.02'
          height='1038.02'
          filterUnits='userSpaceOnUse'
          color-interpolation-filters='sRGB'
        >
          <feFlood flood-opacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='1.70455' />
          <feGaussianBlur stdDeviation='1.26263' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0196802 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='4.09626' />
          <feGaussianBlur stdDeviation='3.03427' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0282725 0' />
          <feBlend mode='normal' in2='effect1_dropShadow_5198_1351' result='effect2_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='7.71289' />
          <feGaussianBlur stdDeviation='5.71326' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.035 0' />
          <feBlend mode='normal' in2='effect2_dropShadow_5198_1351' result='effect3_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='13.7585' />
          <feGaussianBlur stdDeviation='10.1915' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0417275 0' />
          <feBlend mode='normal' in2='effect3_dropShadow_5198_1351' result='effect4_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='25.7337' />
          <feGaussianBlur stdDeviation='19.062' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0503198 0' />
          <feBlend mode='normal' in2='effect4_dropShadow_5198_1351' result='effect5_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='61.597' />
          <feGaussianBlur stdDeviation='45.6274' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0' />
          <feBlend mode='normal' in2='effect5_dropShadow_5198_1351' result='effect6_dropShadow_5198_1351' />
          <feBlend mode='normal' in='SourceGraphic' in2='effect6_dropShadow_5198_1351' result='shape' />
        </filter>
        <filter
          id='filter2_dddddd_5198_1351'
          x='606.243'
          y='201.654'
          width='809.885'
          height='809.886'
          filterUnits='userSpaceOnUse'
          color-interpolation-filters='sRGB'
        >
          <feFlood flood-opacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='1.70455' />
          <feGaussianBlur stdDeviation='1.26263' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0196802 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='4.09626' />
          <feGaussianBlur stdDeviation='3.03427' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0282725 0' />
          <feBlend mode='normal' in2='effect1_dropShadow_5198_1351' result='effect2_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='7.71289' />
          <feGaussianBlur stdDeviation='5.71326' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.035 0' />
          <feBlend mode='normal' in2='effect2_dropShadow_5198_1351' result='effect3_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='13.7585' />
          <feGaussianBlur stdDeviation='10.1915' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0417275 0' />
          <feBlend mode='normal' in2='effect3_dropShadow_5198_1351' result='effect4_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='25.7337' />
          <feGaussianBlur stdDeviation='19.062' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0503198 0' />
          <feBlend mode='normal' in2='effect4_dropShadow_5198_1351' result='effect5_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='61.597' />
          <feGaussianBlur stdDeviation='45.6274' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0' />
          <feBlend mode='normal' in2='effect5_dropShadow_5198_1351' result='effect6_dropShadow_5198_1351' />
          <feBlend mode='normal' in='SourceGraphic' in2='effect6_dropShadow_5198_1351' result='shape' />
        </filter>
        <filter
          id='filter3_dddddd_5198_1351'
          x='720.312'
          y='315.723'
          width='581.749'
          height='581.749'
          filterUnits='userSpaceOnUse'
          color-interpolation-filters='sRGB'
        >
          <feFlood flood-opacity='0' result='BackgroundImageFix' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='1.70455' />
          <feGaussianBlur stdDeviation='1.26263' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0196802 0' />
          <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='4.09626' />
          <feGaussianBlur stdDeviation='3.03427' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0282725 0' />
          <feBlend mode='normal' in2='effect1_dropShadow_5198_1351' result='effect2_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='7.71289' />
          <feGaussianBlur stdDeviation='5.71326' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.035 0' />
          <feBlend mode='normal' in2='effect2_dropShadow_5198_1351' result='effect3_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='13.7585' />
          <feGaussianBlur stdDeviation='10.1915' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0417275 0' />
          <feBlend mode='normal' in2='effect3_dropShadow_5198_1351' result='effect4_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='25.7337' />
          <feGaussianBlur stdDeviation='19.062' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0503198 0' />
          <feBlend mode='normal' in2='effect4_dropShadow_5198_1351' result='effect5_dropShadow_5198_1351' />
          <feColorMatrix
            in='SourceAlpha'
            type='matrix'
            values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
            result='hardAlpha'
          />
          <feOffset dy='61.597' />
          <feGaussianBlur stdDeviation='45.6274' />
          <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0' />
          <feBlend mode='normal' in2='effect5_dropShadow_5198_1351' result='effect6_dropShadow_5198_1351' />
          <feBlend mode='normal' in='SourceGraphic' in2='effect6_dropShadow_5198_1351' result='shape' />
        </filter>
        <clipPath id='clip0_5198_1351'>
          <rect width='1012' height='526' fill='white' style={{ fill: 'white', fillOpacity: 1 }} />
        </clipPath>
        <clipPath id='clip1_5198_1351'>
          <rect
            width='1267'
            height='1267'
            fill='white'
            style={{ fill: 'white', fillOpacity: 1 }}
            transform='translate(378 -27)'
          />
        </clipPath>
      </defs>
    </svg>
  )
}
