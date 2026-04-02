import { internalAction } from './_generated/server'
import { v } from 'convex/values'

const FROM_EMAIL = 'Campsite <noreply@updates.reciperoom.io>'

export const sendOrganizationInvitation = internalAction({
  args: {
    to: v.string(),
    senderName: v.string(),
    organizationName: v.string(),
    invitationUrl: v.string()
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY

    if (!apiKey) {
      console.error('RESEND_API_KEY is not set')
      return
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <p><strong>${args.senderName}</strong> invited you to join <strong>${args.organizationName}</strong> on Campsite.</p>
        <p>
          <a href="${args.invitationUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Accept invitation
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Campsite is where teams share work-in-progress — prototypes, screenshots, code, and everything in-between.
        </p>
      </div>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: args.to,
        subject: `${args.senderName} invited you to ${args.organizationName} on Campsite`,
        html
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend error:', error)
    }
  }
})
