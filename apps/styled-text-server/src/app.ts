import * as Sentry from '@sentry/node'
import bodyParser from 'body-parser'
import express from 'express'
import morgan from 'morgan'

import { htmlToSlack } from './html'
import { markdownToHtml } from './markdown'

export const app: express.Express = express()

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://cace67e62da1a116fd2fa2a30a3cd1d9@o1244295.ingest.us.sentry.io/4506985116401664',
    debug: process.env.NODE_ENV !== 'production',
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0
  })
}

console.log('NODE_ENV', process.env.NODE_ENV)

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler())

app.use(morgan('combined'))
app.use(bodyParser.text({ limit: '5mb' }))
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }))
app.use((req, res, next) => {
  if (req.header('Authorization') != `Bearer ${process.env.AUTHTOKEN}`) {
    return res.status(401).json({ message: 'invalid token' })
  }

  next()
})

app.post('/html_to_slack', bodyParser.json(), (req, res) => {
  if (!req.is('*/json')) {
    return res.status(415).json({ message: 'request must be application/json' })
  }

  const { html } = req.body

  const blocks = htmlToSlack(html)

  res.json(blocks)
})

app.post('/markdown_to_html', bodyParser.json(), (req, res) => {
  if (!req.is('*/json')) {
    return res.status(415).json({ message: 'request must be application/json' })
  }

  const { markdown, editor } = req.body

  if (!markdown) {
    return res.status(400).json({ message: 'markdown and editor are required' })
  }

  if (typeof markdown !== 'string') {
    return res.status(400).json({ message: 'markdown must be a string' })
  }

  res.json({ html: markdownToHtml(markdown, editor) })
})

// The error handler must be before any other error middleware and after all controllers
app.use(
  Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      return !error.status || parseInt(`${error.status}`) >= 400
    }
  })
)
