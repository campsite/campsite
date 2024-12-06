const WEB_URL_PROD = 'https://app.campsite.com'
const WEB_URL_DEV = 'http://app.campsite.test:3000'

const SITE_URL_PROD = 'https://www.campsite.com'
const SITE_URL_DEV = 'http://campsite.test:3003'

const SYNC_URL_PROD = 'wss://sync.campsite.com'
const SYNC_URL_DEV = 'ws://localhost:9000'

export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const SCOPE_COOKIE_NAME = 'scope'
export const POLL_OPTION_DESCRIPTION_LENGTH = 32

export const IS_NGROK = !!process.env.NEXT_PUBLIC_IS_NGROK

export const WEB_URL = IS_PRODUCTION ? WEB_URL_PROD : process.env.NEXT_PUBLIC_WEB_URL || WEB_URL_DEV
export const SITE_URL = IS_PRODUCTION ? SITE_URL_PROD : SITE_URL_DEV
export const SYNC_URL = IS_PRODUCTION ? SYNC_URL_PROD : process.env.NEXT_PUBLIC_SYNC_URL || SYNC_URL_DEV

export const DESKTOP_APP_PROTOCOL = IS_PRODUCTION ? 'campsite://' : 'campsite-dev://'
export const LAST_CLIENT_JS_BUILD_ID_LS_KEY = 'latest-js-time'

export const RAILS_API_URL = IS_PRODUCTION
  ? 'https://api.campsite.com'
  : process.env.NEXT_PUBLIC_API_URL || 'http://api.campsite.test:3001'

const RAILS_AUTH_URL_PROD_COM = 'https://auth.campsite.com'

export const RAILS_AUTH_URL = IS_PRODUCTION
  ? RAILS_AUTH_URL_PROD_COM
  : process.env.NEXT_PUBLIC_AUTH_URL || 'http://auth.campsite.test:3001'

/*
  Not using an env variable because we use this variable in the browser, which
  requires extra config with Next.js to send env variables to the browser.
*/
export const IMGIX_DOMAIN = IS_PRODUCTION ? 'https://campsite.imgix.net' : 'https://campsite-dev.imgix.net'

export const FIGMA_PLUGIN_URL = 'https://www.figma.com/community/plugin/1108886817260186751'
export const ZAPIER_APP_URL = 'https://zapier.com/apps/campsite/integrations'
export const GOOGLE_CALENDAR_ADD_ON_URL = 'https://workspace.google.com/marketplace/app/campsite/723431485517'
export const CAL_DOT_COM_APP_URL = 'https://app.cal.com/apps/campsite'

export const LINEAR_CALLBACK_URL = `${RAILS_API_URL}/v1/integrations/linear/callback`
export const LINEAR_DEV_CLIENT_ID = 'bc6d5e0c459d67c42ae462f1167736da'
export const LINEAR_PROD_CLIENT_ID = '1dcf5d89abd0be6367a24637e100e6b8'
export const LINEAR_CLIENT_ID = IS_PRODUCTION ? LINEAR_PROD_CLIENT_ID : LINEAR_DEV_CLIENT_ID

export const ONBOARDING_STEP_KEY = 'onboardingStep'
export const ONBOARDING_SHARED_POSTS_KEY = 'onboardingPostIds'

export const PUSHER_KEY = IS_PRODUCTION ? '1301e1180de87095b1c0' : '874a1de2f18896929939'
export const PUSHER_APP_CLUSTER = 'us3'

// Key is generated from the VAPID keys in the Rails app but without padding ("=")
export const WEB_PUSH_PUBLIC_KEY =
  'BF151mIoXtZOsN_515tWb1ykezZZn1HIkDP-fwRjhPOyiKl29G4WwEvFWyxwlLuN0YE_TvyIcx5liEctScKX3nI'

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
