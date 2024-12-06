import { Logger } from '@hocuspocus/extension-logger'
import { Hocuspocus } from '@hocuspocus/server'
import * as Sentry from '@sentry/node'
import * as dotenv from 'dotenv'

import { database, getResource, sendVersionToConnections } from './database'
import { AuthenticationError, Context } from './types'

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://72810e9888151e1a6207aadb2a6c38d6@o1244295.ingest.sentry.io/4506022249103360',
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0
  })
}

dotenv.config()

const server = new Hocuspocus({
  port: parseInt(process.env.PORT || '9000', 10),

  async onAuthenticate(data): Promise<Context> {
    if (!data.token) {
      throw new AuthenticationError('no-token')
    }

    const schemaVersion = parseInt(data.requestParameters.get('schemaVersion') || '', 10)
    const organization = data.requestParameters.get('organization')
    const type = data.requestParameters.get('type')

    if (!organization) {
      throw new AuthenticationError('invalid-type')
    }

    try {
      const state = await getResource({ token: data.token, id: data.documentName, type, organization })

      if (!state) {
        throw new AuthenticationError('invalid-type')
      }

      const document = data.instance.documents.get(data.documentName)

      if (document) sendVersionToConnections(document, state.description_schema_version)
      data.connection.readOnly = schemaVersion < state.description_schema_version

      return {
        token: data.token,
        schemaVersion
      }
    } catch (error) {
      Sentry.setContext('document', {
        id: data.documentName,
        organization,
        type
      })
      Sentry.setContext('context', {
        schemaVersion: schemaVersion,
        token: data.token
      })
      Sentry.captureException(error)
      throw error
    }
  },

  extensions: [database, new Logger()]
})

server.listen()
