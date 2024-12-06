/** @type {import('next').NextConfig} */

const { withSentryConfig } = require('@sentry/nextjs')
const createMDX = require('@next/mdx')

const config = {
  experimental: {
    /**
     *
     * Why do we need this?
     *
     * `@campsite/site` depends on `@campsite/ui` which depends `react-day-picker`
     * which depends on an ESM only package `date-fns`.
     *
     * @see https://nextjs.org/docs/messages/import-esm-externals
     */
    esmExternals: 'loose'
  },
  transpilePackages: ['@campsite/ui', '@campsite/config'],
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    domains: ['campsite.imgix.net', 'campsite-dev.imgix.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'user-images.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/support',
        destination: '/contact',
        permanent: true
      },
      {
        source: '/security',
        destination: 'https://www.notion.so/campsite/Campsite-Security-b9cee5dd2a624b0abe4cfaa29a909831',
        permanent: true
      },
      {
        source: '/desktop/download',
        destination: 'https://dl.todesktop.com/221108gwi9omzf9',
        permanent: false
      },
      {
        source: '/figma/plugin',
        destination: 'https://www.figma.com/community/plugin/1108886817260186751',
        permanent: false
      },
      {
        source: '/follow',
        destination: 'https://www.twitter.com/trycampsite',
        permanent: false
      },
      {
        source: '/follow/twitter',
        destination: 'https://www.twitter.com/trycampsite',
        permanent: false
      },
      {
        source: '/follow/x',
        destination: 'https://www.twitter.com/trycampsite',
        permanent: false
      },
      {
        source: '/follow/threads',
        destination: 'https://www.threads.net/trycampsite',
        permanent: false
      },
      {
        source: '/follow/linkedin',
        destination: 'https://www.linkedin.com/company/campsite-software',
        permanent: false
      },
      {
        source: '/follow/github',
        destination: 'https://github.com/campsite',
        permanent: false
      },
      {
        source: '/community',
        destination: 'https://app.campsite.com/design/join',
        permanent: false
      },
      {
        source: '/start',
        destination: 'https://auth.campsite.com/sign-up',
        permanent: false
      },
      {
        source: '/early',
        destination: '/',
        permanent: true
      },
      {
        source: '/docs',
        destination: 'https://developers.campsite.com',
        permanent: false
      },
      {
        source: '/blog/how-we-use-spaces-to-keep-our-conversations-organized',
        destination: '/blog/how-we-use-channels-to-keep-our-conversations-organized',
        permanent: true
      },
      {
        source: '/glossary',
        destination: '/glossary/slack',
        permanent: false
      }
    ]
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ]
      }
    ]
  },
  async rewrites() {
    return [
      /**
       * @see https://posthog.com/docs/advanced/proxy/nextjs
       */
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*'
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*'
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide'
      }
    ]
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true
}

const withMDX = createMDX({})

const configWithMDX = withMDX(config)

const sentryWebpackPluginOptions = {
  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  project: 'campsite-site',
  org: 'campsite-software',
  widenClientFileUpload: true,
  hideSourceMaps: true,
  debug: false,
  tunnelRoute: '/monitoring-tunnel'
}

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(configWithMDX, sentryWebpackPluginOptions)
