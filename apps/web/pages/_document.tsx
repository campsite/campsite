import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'

import { cn } from '@campsite/ui/src/utils'

import { SVGClips } from '@/components/SVGClips'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)

    return { ...initialProps }
  }

  render() {
    return (
      <Html lang='en' className='fixed isolate h-full w-full overflow-hidden'>
        <Head>
          <meta name='slack-app-id' content='A03CG5AP4CE' />
          <link rel='preconnect' href='https://api.campsite.com' />
          <link rel='preconnect' href='https://campsite.imgix.net' />
          <link rel='preconnect' href='https://o1244295.ingest.sentry.io' />
        </Head>

        <body
          className={cn(
            'bg-primary text-primary fixed isolate select-none overflow-hidden antialiased',
            // force the body to be full width and height, so that libraries
            // like vaul can't highjack the dimensions and screw the layout
            '!h-full !w-full'
          )}
        >
          <a href='#main' className='sr-only'>
            Skip to content
          </a>

          <Main />
          <NextScript />

          {/* 
            Thread <HoverCard> needs to be portaled before lightbox attachments
            in order to have the correct stacking order. Attachments should always
            be opened above the peeked card. 
          */}
          <div id='quick-thread' />
          {/* 
            Read this post for more context: https://app.campsite.com/campsite/posts/8vmro5yao61v
            PR: https://github.com/campsite/campsite/pull/5182

            tl;dr — when you're on a call, you might open a post's attachment lightbox. In this case,
            the call should be above the lightbox. In order for this to work, we need to define
            a portal container for the lightbox to render into that will always be below the call.
          */}
          <div id='lightbox-portal' />

          {/* 
            This makes no sense, but we need this hidden input element to fix
            a Safari bug where closing a fixed-position dialog will scroll the
            user to the bottom of the page. This is likely because Safari loses
            track of some kind of tabIndex, and a fake input element fixes it.

            See more: https://github.com/algolia/docsearch/issues/1260
          */}
          <div className='fixed'>
            <input
              type='text'
              style={{
                position: 'absolute',
                left: '-999999px',
                top: '-99999px',
                opacity: 0
              }}
            />
          </div>

          <SVGClips />
        </body>
      </Html>
    )
  }
}

export default MyDocument
