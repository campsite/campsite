import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const CAMPSITE_API_KEY = process.env.CAMPSITE_STRIPE_APP_KEY
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const NEW_CUSTOMERS_CHANNEL_ID = process.env.NEW_CUSTOMERS_CHANNEL_ID

const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

async function createCampsitePost(title: string, content: string) {
  const response = await fetch(`${process.env.CAMPSITE_API_BASE}/posts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CAMPSITE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title,
      content_markdown: content,
      channel_id: NEW_CUSTOMERS_CHANNEL_ID
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to create Campsite post: ${response.statusText}`)
  }

  return response.json()
}

function viewInStripeLink(subscription: Stripe.Subscription) {
  return `[View in Stripe](https://dashboard.stripe.com/subscriptions/${subscription.id})`
}

function viewInRetoolLink(orgId: string) {
  return `[View in Retool](https://campsitesoftware.retool.com/app/org-details?org=${orgId})`
}

function inDollars(amount: number) {
  return currencyFormatter.format(amount / 100)
}

function costMessage(item: Stripe.SubscriptionItem, direction: 'upgraded' | 'downgraded') {
  const seats = item.quantity ?? 1
  const perSeatAmount = item.price.unit_amount ?? 0
  const interval = item.plan.interval
  const monthlyPerSeat = interval === 'month' ? perSeatAmount : perSeatAmount / 12
  const term = interval === 'month' ? 'monthly' : 'annually'
  const mrr = monthlyPerSeat * seats
  const mrrChange = (direction === 'upgraded' ? '+' : '-') + inDollars(mrr)

  // Format: (1 annually at $1.00 / month, +$1.00 total MRR)
  return `(${seats} ${term} at ${inDollars(monthlyPerSeat)} / month, ${mrrChange} total MRR)`
}

async function composeNewCustomerMessage(customerId: string, subscription: Stripe.Subscription) {
  const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer
  const customerName = customer.name || customer.email
  const orgId = customer.metadata.db_id as string | undefined

  const item = subscription.items.data[0]

  if (!item) {
    throw new Error('Subscription item not found')
  }

  const seats = item.quantity ?? 1

  let message = `${customerName} upgraded with ${seats} ${seats === 1 ? 'seat' : 'seats'}!`

  if (item.price.billing_scheme === 'per_unit' && item.price.unit_amount !== null) {
    message += ` ${costMessage(item, 'upgraded')}`
  }

  const links = [viewInStripeLink(subscription)]

  if (orgId) {
    links.push(viewInRetoolLink(orgId))
  }

  const title = `New customer: ${customerName}`
  const content = [message, links.join(' | ')].join('\n\n')

  return { title, content }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event

  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, STRIPE_WEBHOOK_SECRET!, undefined)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
    return NextResponse.json((err as Error).message, { status: 400 })
  }

  try {
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription

      if (subscription.status === 'active') {
        const { title, content } = await composeNewCustomerMessage(subscription.customer.toString(), subscription)

        await createCampsitePost(title, content)
      }
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription

      // Some subscriptions may start out as "incomplete" (e.g. requires payment method)
      // and then switch to active after payment is made. For those we will receive an `updated` alert.
      if (subscription.status === 'active' && event.data.previous_attributes?.status === 'incomplete') {
        const { title, content } = await composeNewCustomerMessage(subscription.customer.toString(), subscription)

        await createCampsitePost(title, content)
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription

      if (subscription.status === 'canceled') {
        const customer = (await stripe.customers.retrieve(subscription.customer.toString())) as Stripe.Customer
        const item = subscription.items.data[0]
        const seats = item.quantity

        const title = `Cancelled subscription: ${customer.name}`
        let message = `${customer.name} canceled their subscription with ${seats} ${seats === 1 ? 'seat' : 'seats'}.`

        if (item.price.billing_scheme === 'per_unit' && item.price.unit_amount !== null) {
          message += ` ${costMessage(item, 'downgraded')}`
        }

        const content = [message, viewInStripeLink(subscription)].join('\n\n')

        await createCampsitePost(title, content)
      }
    }

    return NextResponse.json('Webhook handled successfully', { status: 200 })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error handling webhook:', error)
    return NextResponse.json('Webhook error', { status: 400 })
  }
}
