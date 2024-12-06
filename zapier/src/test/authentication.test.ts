import { createAppTester } from 'zapier-platform-core'

import env from '../env'
import App from '../index'
import { mockAuthApi } from '../utils/mockApi'

const appTester = createAppTester(App)

describe('oauth2 auth', () => {
  beforeAll(() => {
    if (!(env.CLIENT_ID && env.CLIENT_SECRET)) {
      throw new Error(
        `Before running the tests, make sure CLIENT_ID and CLIENT_SECRET are available in the environment.`
      )
    }
  })

  it('can fetch an access token', async () => {
    const bundle = {
      inputData: {
        // In production, Zapier passes along whatever code your API set in the query params when it redirects
        // the user's browser to the `redirect_uri`
        code: 'one_time_code'
      },
      environment: {
        CLIENT_ID: env.CLIENT_ID,
        CLIENT_SECRET: env.CLIENT_SECRET
      },
      cleanedRequest: {
        querystring: {
          accountDomain: 'test-account',
          code: 'one_time_code'
        }
      },
      rawRequest: {
        querystring: '?accountDomain=test-account&code=one_time_code'
      }
    }

    mockAuthApi.post('/oauth/token').reply(200, {
      access_token: 'a_token',
      refresh_token: 'a_refresh_token'
    })

    const result = await appTester(App.authentication.oauth2Config.getAccessToken, bundle)

    expect(result.access_token).toBe('a_token')
    expect(result.refresh_token).toBe('a_refresh_token')
  })

  it('can refresh the access token', async () => {
    const bundle = {
      authData: {
        access_token: 'a_token',
        refresh_token: 'a_refresh_token'
      },
      environment: {
        CLIENT_ID: env.CLIENT_ID,
        CLIENT_SECRET: env.CLIENT_SECRET
      }
    }

    mockAuthApi.post('/oauth/token').reply(200, {
      access_token: 'a_new_token',
      refresh_token: 'a_refresh_token'
    })

    const result = await appTester(App.authentication.oauth2Config.refreshAccessToken, bundle)
    expect(result.access_token).toBe('a_new_token')
  })

  it('includes the access token in future requests', async () => {
    const bundle = {
      authData: {
        access_token: 'a_token',
        refresh_token: 'a_refresh_token'
      }
    }

    mockAuthApi.get('/oauth/token/info').reply(200, {
      resource_name: 'Frontier Forest'
    })

    const response = await appTester(App.authentication.test, bundle)
    expect(response.data).toHaveProperty('resource_name')
    expect(response.data.resource_name).toBe('Frontier Forest')
  })

  it('fails on bad auth', async () => {
    const bundle = {
      authData: {
        access_token: 'bad_token',
        refresh_token: 'bad_refresh_token'
      }
    }

    try {
      mockAuthApi.get('/oauth/token/info').reply(401, {
        code: 'invalid_request',
        message: 'The connection is invalid. Please reconnect'
      })

      await appTester(App.authentication.test, bundle)
    } catch (error: any) {
      expect(error.message).toContain('The connection is invalid. Please reconnect')
      return
    }

    throw new Error('appTester should have thrown')
  })
})
