import * as Sentry from '@sentry/nextjs'
import {
  ComponentDividerSpacingSize,
  ComponentSpacerSize,
  ComponentTextColor,
  ComponentTextSize,
  PlainClient
} from '@team-plain/typescript-sdk'
import type { NextApiRequest, NextApiResponse } from 'next'

const apiKey = process.env.PLAIN_CONTACT_FORM_API_KEY

if (!apiKey) {
  throw new Error('PLAIN_CONTACT_FORM_API_KEY environment variable is not set')
}

const client = new PlainClient({
  apiKey
})

export interface ResponseData {
  error: string | null
}

export interface ContactFormRequestBody {
  name: string
  email: string
  message: string
  companyName: string
  subjectPrefix?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const body = req.body as ContactFormRequestBody
  const prefix = body.subjectPrefix ? `${body.subjectPrefix}` : 'Contact form:'

  const upsertCustomerRes = await client.upsertCustomer({
    identifier: {
      emailAddress: body.email
    },
    onCreate: {
      fullName: body.name,
      email: {
        email: body.email,
        isVerified: true
      }
    },
    onUpdate: {}
  })

  if (upsertCustomerRes.error) {
    Sentry.captureException(upsertCustomerRes.error)
    return res.status(500).json({ error: upsertCustomerRes.error.message })
  }

  const upsertTimelineEntryRes = await client.createThread({
    customerIdentifier: {
      customerId: upsertCustomerRes.data.customer.id
    },
    title: `${prefix} ${body.name} (${body.email})`,
    components: [
      {
        componentText: {
          text: `New message from ${body.name} (${body.email})`
        }
      },
      {
        componentDivider: {
          dividerSpacingSize: ComponentDividerSpacingSize.M
        }
      },
      {
        componentText: {
          textSize: ComponentTextSize.S,
          textColor: ComponentTextColor.Muted,
          text: 'Email'
        }
      },
      {
        componentText: {
          text: body.email
        }
      },
      {
        componentSpacer: {
          spacerSize: ComponentSpacerSize.M
        }
      },
      {
        componentText: {
          textSize: ComponentTextSize.S,
          textColor: ComponentTextColor.Muted,
          text: 'Company'
        }
      },
      {
        componentText: {
          text: body.companyName
        }
      },
      {
        componentSpacer: {
          spacerSize: ComponentSpacerSize.M
        }
      },
      {
        componentSpacer: {
          spacerSize: ComponentSpacerSize.M
        }
      },
      {
        componentText: {
          textSize: ComponentTextSize.S,
          textColor: ComponentTextColor.Muted,
          text: 'Message'
        }
      },
      {
        componentText: {
          text: body.message
        }
      }
    ]
  })

  if (upsertTimelineEntryRes.error) {
    Sentry.captureException(upsertTimelineEntryRes.error)
    return res.status(500).json({ error: upsertTimelineEntryRes.error.message })
  }

  res.status(200).json({ error: null })
}
