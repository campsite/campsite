import 'dotenv/config'

import { z } from 'zod'

const envSchema = z.object({
  API_BASE: z.string(),
  CLIENT_ID: z.string(),
  CLIENT_SECRET: z.string()
})

const env = envSchema.parse(process.env)

export default env
