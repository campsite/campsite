const DEFAULT_WEB_URL_PROD = 'https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app'
const WEB_URL_PROD = stripTrailingSlash(
  firstDefined(
    process.env.NEXT_PUBLIC_WEB_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
    DEFAULT_WEB_URL_PROD
  ) as string
)
const WEB_URL_DEV = stripTrailingSlash(firstDefined(process.env.NEXT_PUBLIC_WEB_URL, 'http://localhost:3000') as string)

const SITE_URL_PROD = WEB_URL_PROD
const SITE_URL_DEV = WEB_URL_DEV

const SYNC_URL_DEV = firstDefined(process.env.NEXT_PUBLIC_SYNC_URL, 'ws://localhost:9000') as string

const RAILS_API_URL_DEV = WEB_URL_DEV

const RAILS_AUTH_URL_DEV = WEB_URL_DEV

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const SCOPE_COOKIE_NAME = 'scope'
export const POLL_OPTION_DESCRIPTION_LENGTH = 32

export const IS_NGROK = !!process.env.NEXT_PUBLIC_IS_NGROK

function firstDefined(...values: Array<string | undefined>) {
  return values.find((value) => !!value)
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, '')
}

export const WEB_URL = firstDefined(process.env.NEXT_PUBLIC_WEB_URL, IS_PRODUCTION ? WEB_URL_PROD : WEB_URL_DEV) as string
export const SITE_URL = firstDefined(
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_WEB_URL,
  IS_PRODUCTION ? SITE_URL_PROD : SITE_URL_DEV
) as string
export const SYNC_URL = firstDefined(process.env.NEXT_PUBLIC_SYNC_URL, IS_PRODUCTION ? undefined : SYNC_URL_DEV) || ''

export const DESKTOP_APP_PROTOCOL = IS_PRODUCTION ? 'campsite://' : 'campsite-dev://'
export const LAST_CLIENT_JS_BUILD_ID_LS_KEY = 'latest-js-time'

export const RAILS_API_URL = firstDefined(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_WEB_URL,
  WEB_URL,
  IS_PRODUCTION ? WEB_URL_PROD : RAILS_API_URL_DEV
) as string

export const RAILS_AUTH_URL = firstDefined(
  process.env.NEXT_PUBLIC_AUTH_URL,
  process.env.NEXT_PUBLIC_WEB_URL,
  WEB_URL,
  IS_PRODUCTION ? WEB_URL_PROD : RAILS_AUTH_URL_DEV
) as string

/*
  Not using an env variable because we use this variable in the browser, which
  requires extra config with Next.js to send env variables to the browser.
*/
export const IMGIX_DOMAIN = stripTrailingSlash(
  firstDefined(process.env.NEXT_PUBLIC_MEDIA_BASE_URL, process.env.NEXT_PUBLIC_WEB_URL, WEB_URL) as string
)

export const FIGMA_PLUGIN_URL = 'https://www.figma.com/community/plugin/1108886817260186751'
export const ZAPIER_APP_URL = 'https://zapier.com/apps/campsite/integrations'
export const CAL_DOT_COM_APP_URL = 'https://app.cal.com/apps/campsite'

export const LINEAR_CALLBACK_URL = `${RAILS_API_URL}/v1/integrations/linear/callback`
export const LINEAR_DEV_CLIENT_ID = 'bc6d5e0c459d67c42ae462f1167736da'
export const LINEAR_PROD_CLIENT_ID = '1dcf5d89abd0be6367a24637e100e6b8'
export const LINEAR_CLIENT_ID = IS_PRODUCTION ? LINEAR_PROD_CLIENT_ID : LINEAR_DEV_CLIENT_ID

export const ONBOARDING_STEP_KEY = 'onboardingStep'
export const ONBOARDING_SHARED_POSTS_KEY = 'onboardingPostIds'

export const PUSHER_KEY = firstDefined(process.env.NEXT_PUBLIC_PUSHER_KEY, '') as string
export const PUSHER_APP_CLUSTER = firstDefined(process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER, 'us3') as string

export const WEB_PUSH_PUBLIC_KEY = firstDefined(process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY, '') as string

const DEFAULT_SEO_TITLE = 'Campsite — Work communication for distributed teams'
const DEFAULT_SEO_DESCRIPTION =
  'Campsite is designed for distributed teams to cut through the noise of daily work — move faster with more transparent, organized, and thoughtful conversations.'
const DEFAULT_SEO_IMAGE = {
  url: `${SITE_URL}/og/default.png`,
  alt: 'Campsite'
}

export const DEFAULT_SEO = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: './'
  },
  title: DEFAULT_SEO_TITLE,
  description: DEFAULT_SEO_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    site_name: 'Campsite', // used by next-seo
    siteName: 'Campsite', // used by next.js
    images: [DEFAULT_SEO_IMAGE]
  },
  twitter: {
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
    images: [DEFAULT_SEO_IMAGE],
    handle: '@trycampsite',
    site: '@trycampsite',
    cardType: 'summary_large_image'
  }
}

export const MAX_FILE_NUMBER = 10
export const ONE_GB = 1024 * 1024 * 1024

export const COMMUNITY_SLUG = 'design'
export const CAMPSITE_SCOPE = 'campsite'

export const COUNTED_ROLES = ['admin', 'member']

export * from './slack'
