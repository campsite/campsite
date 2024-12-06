import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  beforeSend(event, hint) {
    // Check if the error is a TypeError: Failed to fetch
    if (hint.originalException instanceof TypeError && hint.originalException.message === 'Failed to fetch') {
      const anyFrameHasVercelSpeedInsightsVitals = event.exception?.values?.some((value) =>
        value.stacktrace?.frames?.some((frame) => frame.filename?.includes('_vercel/speed-insights'))
      )

      if (anyFrameHasVercelSpeedInsightsVitals) {
        // Ignore the error
        return null
      }
    }
    // If conditions are not met, return the event
    return event
  },
  ignoreErrors: [
    // https://linear.app/campsite/issue/CAM-601/ignore-error-invariant-attempted-to-hard-navigate-to-the-same-url
    /Invariant: attempted to hard navigate to the same URL.*/,
    // https://linear.app/campsite/issue/CAM-10681/typeerror-the-provided-value-is-non-finite
    /TypeError: The provided value is non-finite/,
    // https://linear.app/campsite/issue/CAM-9695/error-wasm-or-worker-not-ready
    /Error: WASM_OR_WORKER_NOT_READY/,

    // occurs when changing the URL mid-render
    'Cancel rendering route',

    // Campsite API errors
    'Something unexpected happened, please try again',

    // Tried to fix this over & over, only happens on windows,
    "Failed to execute 'setAppBadge' on 'Navigator'",

    // Generic fetch errors
    "The fetching process for the media resource was aborted by the user agent at the user's request",
    /Load failed/,
    /TypeError: Load failed/,
    /Failed to fetch/,
    /TypeError: Failed to fetch/,

    // Generic React errors
    // Ignore errors to hydration or DOM mismatch. These are usually caused by browser extensions that manipulate the DOM (i.e. Grammarly)
    /Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node/,
    /Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node./,

    // Resize observer errors
    'ResizeObserver loop limit exceeded',
    'AbortError: The operation was aborted',
    'ResizeObserver loop completed with undelivered notifications',

    // Play permissions
    'AbortError: The play() request was interrupted by a call to pause()',
    'AbortError: The play() request was interrupted because video-only background media',
    'The play() request was interrupted by',
    'play() failed because the user',
    'not allowed by the user agent or the platform in the current context, possibly because the user denied permission',

    // Clipboard permissions
    /Failed to execute 'writeText' on 'Clipboard': Document is not focused\./,

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
    // https://github.com/getsentry/sentry-javascript/issues/3440
    /Non-Error promise rejection captured with value: Object Not Found Matching Id.*/,

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
  // Control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['api.campsite.test', 'api.campsite.com'],
  // Adjust this value in production, or use tracesSampler for greater control
  // NOTE that a sampled trace is considered live for the duration of a route and may result in many server traces being logged.
  // https://github.com/getsentry/sentry-ruby/issues/2318
  tracesSampleRate: 0,
  // Set profilesSampleRate to 1.0 to profile every transaction.
  // Since profilesSampleRate is relative to tracesSampleRate,
  // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
  // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
  // results in 25% of transactions being profiled (0.5*0.5=0.25)
  profilesSampleRate: 0
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
})
