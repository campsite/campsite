import 'dotenv/config'

import { Campsite } from 'campsite-client'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const MEMBERS = [
  '3her0vv6fb75', // Brian,
  'mqssgn0wm7so', // Ryan,
  'ntodpqcg879d', // Nick,
  'zwvznmxcpiel', // Dan,
  'el8fwvr2jttt', // Alexandru,
  'dg7x2842mo7t' // Paul,
]

const MENTIONS = MEMBERS.map((id) => `<@${id}>`).join(' ')

const CONTENT = `What did you work on today?\n\n${MENTIONS}`

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const hasValidAuthKey = authHeader === `Bearer ${process.env.CRON_SECRET}`

  if (process.env.NODE_ENV === 'production' && !hasValidAuthKey) {
    return NextResponse.json({
      success: false,
      message: 'Unauthorized'
    })
  }

  if (!process.env.DAILY_STANDUP_CHANNEL_ID) {
    return NextResponse.json({
      success: false,
      message: 'DAILY_STANDUP_CHANNEL_ID is not set'
    })
  }

  const title = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const campsite = new Campsite({ apiKey: process.env.CAMPSITE_API_KEY })

  await campsite.posts.create({
    title,
    content_markdown: CONTENT,
    channel_id: process.env.DAILY_STANDUP_CHANNEL_ID
  })

  return NextResponse.json({ success: true })
}
