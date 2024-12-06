'use strict'

import { BaseHttpResponse, Bundle, HttpRequestOptions, ZObject } from 'zapier-platform-core'

import { authUrl } from './utils'

const test = (z: ZObject, bundle: Bundle) => {
  return z.request({ url: authUrl('/oauth/token/info') })
}

const handleBadResponses = (response: BaseHttpResponse, z: ZObject, bundle: Bundle) => {
  if (response.status === 401) {
    throw new z.errors.Error(
      // This message is surfaced to the user
      'The connection is invalid. Please reconnect.',
      'AuthenticationError',
      response.status
    )
  }

  return response
}

const includeApiKey = (request: HttpRequestOptions, z: ZObject, bundle: Bundle) => {
  if (bundle.authData.access_token) {
    request.headers = request.headers || {}
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`
  }

  return request
}

const getAccessToken = async (z: ZObject, bundle: Bundle) => {
  const response = await z.request(authUrl('/oauth/token'), {
    method: 'POST',
    body: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: bundle.inputData.redirect_uri,
      grant_type: 'authorization_code',
      code: bundle.inputData.code
    }
  })

  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token
  }
}

const refreshAccessToken = async (z: ZObject, bundle: Bundle) => {
  const response = await z.request(authUrl('/oauth/token'), {
    method: 'POST',
    body: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: bundle.authData.refresh_token
    }
  })

  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token
  }
}

export default {
  config: {
    type: 'oauth2',
    oauth2Config: {
      authorizeUrl: {
        url: authUrl('/oauth/authorize'),
        params: {
          client_id: '{{process.env.CLIENT_ID}}',
          state: '{{bundle.inputData.state}}',
          redirect_uri: '{{bundle.inputData.redirect_uri}}',
          response_type: 'code'
        }
      },
      getAccessToken,
      refreshAccessToken,
      autoRefresh: true
    },
    test,
    connectionLabel: '{{json.resource_name}}'
  },
  befores: [includeApiKey],
  afters: [handleBadResponses]
}
