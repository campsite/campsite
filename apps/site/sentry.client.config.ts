// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  ignoreErrors: [
    // https://linear.app/campsite/issue/CAM-601/ignore-error-invariant-attempted-to-hard-navigate-to-the-same-url
    /Invariant: attempted to hard navigate to the same URL.*/,

    'ResizeObserver loop limit exceeded',
    'AbortError: The operation was aborted',
    'ResizeObserver loop completed with undelivered notifications',

    // Campsite API errors
    'Something unexpected happened, please try again',

    // Generic fetch errors
    "The fetching process for the media resource was aborted by the user agent at the user's request",

    // Play permissions
    'AbortError: The play() request was interrupted by a call to pause()',
    'AbortError: The play() request was interrupted because video-only background media',
    'The play() request was interrupted',
    'play() failed because the user',
    'not allowed by the user agent or the platform in the current context, possibly because the user denied permission',

    // Random plugins/extensions
    'top.GLOBALS',
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'http://tt.epicplay.com',
    "Can't find variable: ZiteReader",
    'jigsaw is not defined',
    'ComboSearch is not defined',
    'http://loading.retry.widdit.com/',
    'atomicFindClose',
    // Facebook borked
    'fb_xd_fragment',
    // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
    // See http://stackoverflow.com/questions/4113268/how-to-stop-javascript-injection-from-vodafone-proxy
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
    // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
    'conduitPage',
    // Generic error code from errors outside the security sandbox
    'Script error.',
    // Safari extensions
    /.*webkit-masked-url.*/,

    // ToDesktop bug
    'window.todesktop._.onNotificationCreated is not a function'
  ],
  denyUrls: [
    // Facebook flakiness
    /graph\.facebook\.com/i,
    // Facebook blocked
    /connect\.facebook\.net\/en_US\/all\.js/i,
    // Woopra flakiness
    /eatdifferent\.com\.woopra-ns\.com/i,
    /static\.woopra\.com\/js\/woopra\.js/i,
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    // Other plugins
    /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
    /webappstoolbarba\.texthelp\.com\//i,
    /metrics\.itunes\.apple\.com\.edgesuite\.net\//i
  ],
  tracesSampleRate: 0
})
