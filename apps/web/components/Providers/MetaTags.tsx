import { atom, useAtomValue } from 'jotai'
import { DefaultSeo } from 'next-seo'
import { useTheme } from 'next-themes'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { DEFAULT_SEO, IS_NGROK } from '@campsite/config'
import { PostSeoInfo } from '@campsite/types'

import { useGetPostSeoInfo } from '@/hooks/useGetPostSeoInfo'

interface Props {
  postSeoInfo?: PostSeoInfo
}

const faviconAtom = atom<string>('/favicon.ico')

export const setFaviconBadgeAtom = atom(null, (_get, set, isBadged: boolean) => {
  set(faviconAtom, isBadged ? '/favicon-badged.ico' : '/favicon.ico')
})

export function GlobalMetaTags() {
  const { resolvedTheme } = useTheme()
  const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
  const appleIcon = IS_NGROK
    ? '/meta/apple-touch-icon-ngrok.png'
    : isProd
      ? '/meta/apple-touch-icon.png'
      : '/meta/apple-touch-icon-dev.png'
  const manifest = IS_NGROK
    ? '/meta/manifest-ngrok.webmanifest'
    : isProd
      ? '/meta/manifest.webmanifest'
      : '/meta/manifest-dev.webmanifest'
  const favicon = useAtomValue(faviconAtom)

  return (
    <Head>
      <link rel='icon' href={favicon} />
      <link rel='apple-touch-icon' href={appleIcon} />
      <meta name='theme-color' content={resolvedTheme === 'light' ? '#FFFFFF' : '#0D0D0D'} />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='mobile-web-app-capable' content='yes' />
      <link rel='manifest' href={manifest} />
    </Head>
  )
}

export function MetaTags(props: Props) {
  const router = useRouter()
  const postId = router.query.postId as string
  const { data: postSeoInfo } = useGetPostSeoInfo(postId, { initialData: props.postSeoInfo })
  const isOrgPage = router.route.startsWith('/[org]')

  return (
    <>
      {postSeoInfo ? (
        <>
          <DefaultSeo
            title={postSeoInfo.seo_title}
            description={postSeoInfo.seo_description}
            openGraph={{
              title: postSeoInfo.seo_title,
              description: postSeoInfo.seo_description,
              images: postSeoInfo.open_graph_image_url
                ? [
                    {
                      url: postSeoInfo.open_graph_image_url,
                      alt: `Feature image for ${postSeoInfo.seo_title}`
                    }
                  ]
                : DEFAULT_SEO.openGraph.images,
              videos: postSeoInfo.open_graph_video_url
                ? [
                    {
                      url: postSeoInfo.open_graph_video_url,
                      alt: `Feature video for ${postSeoInfo.seo_title}`
                    }
                  ]
                : []
            }}
          />
          <Head>
            <title>{postSeoInfo.seo_title}</title>
          </Head>
        </>
      ) : (
        <DefaultSeo
          {...DEFAULT_SEO}
          title={isOrgPage ? 'Campsite' : DEFAULT_SEO.title}
          openGraph={{
            ...DEFAULT_SEO.openGraph,
            // exclude open graph images from org pages because they don't provide value in Slack, iMessage, etc.
            images: isOrgPage ? [] : DEFAULT_SEO.openGraph.images
          }}
        />
      )}
      <GlobalMetaTags />
    </>
  )
}
