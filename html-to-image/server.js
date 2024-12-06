import * as Sentry from '@sentry/node'
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import { Cluster } from 'puppeteer-cluster'

;(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 4,
    puppeteerOptions: {
      headless: 'shell',
      executablePath: process.env.NODE_ENV === 'production' ? '/usr/bin/google-chrome' : undefined,
      args: ['--no-sandbox', '--disable-gpu']
    }
  })

  await cluster.task(async ({ page, data }) => {
    const { html, styles, width, height = null, deviceScaleFactor = 1, theme = 'light' } = data

    console.log('received params', { html: !!html, styles: !!styles, width, height, deviceScaleFactor, theme })

    await page.emulateMediaFeatures([
      {
        name: 'prefers-color-scheme',
        value: theme
      }
    ])

    // To prevent memory issues, cap the height to 2x the width
    const maxHeight = Math.max(height || 0, width * 2)

    await page.setViewport({ width, height: maxHeight, deviceScaleFactor })
    await page.setContent(html)
    await page.addStyleTag({ content: styles })

    const bodyHandle = await page.$('.prose')
    const boundingBox = await bodyHandle.boundingBox()
    const boundingBoxHeight = Math.min(maxHeight, Math.ceil(boundingBox.height))

    await page.setViewport({ width, height: boundingBoxHeight })

    const screenshot = await page.screenshot({ fullPage: false, omitBackground: true })

    await bodyHandle.dispose()

    return screenshot
  })

  dotenv.config()

  const app = express()

  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: 'https://3091d31166884c3a90384a560351ee0b@o1244295.ingest.sentry.io/4505478458245120',
      debug: process.env.NODE_ENV !== 'production',
      environment: process.env.NODE_ENV ?? 'development',
      tracesSampleRate: 0
    })
  }

  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler())

  app.use(morgan('combined'))
  app.use(bodyParser.json({ limit: '5mb' }))
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }))

  app.post('/image', bodyParser.json(), async (req, res) => {
    if (!req.is('*/json')) {
      return res.status(415).json({ message: 'request must be application/json' })
    }

    const screenshot = await cluster.execute(req.body)

    res.set('Content-Type', 'image/png')
    res.send(screenshot)
  })

  // The error handler must be before any other error middleware and after all controllers
  app.use(
    Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        return !error.status || parseInt(`${error.status}`) >= 400
      }
    })
  )

  const port = process.env.PORT || 3000
  app.listen(port, function () {
    console.log(`html-to-image listening on port ${port}`)
  })
})()
