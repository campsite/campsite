import { tools } from 'zapier-platform-core'

import env from '../env'

tools.env.inject()

describe('core', () => {
  test('env vars', async () => {
    expect(env.API_BASE).not.toBeUndefined()
  })
})
