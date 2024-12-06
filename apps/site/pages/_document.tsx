import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)

    return { ...initialProps }
  }

  render() {
    return (
      <Html lang='en'>
        <Head>
          <meta name='slack-app-id' content='A03CG5AP4CE' />
        </Head>

        <body className='bg-primary dark:bg-neutral-950'>
          <span className='sr-only'>
            <a href='#main'>Skip to content</a>
            <a href='#list'>jump to list</a>
          </span>

          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
