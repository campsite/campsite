# frozen_string_literal: true

class SubscriptionInvoiceJob < BaseJob
  sidekiq_options queue: "within_30_minutes"

  def perform(scheduled_subscription_invoice_id)
    scheduled_subscription_invoice = ScheduledSubscriptionInvoice.find(scheduled_subscription_invoice_id)
    return unless scheduled_subscription_invoice.due?

    scheduled_subscription_invoice.update!(payment_attempted_at: Time.current)

    Stripe::Invoice.create({
      customer: scheduled_subscription_invoice.organization.stripe_customer_id,
      subscription: scheduled_subscription_invoice.stripe_subscription_id,
      auto_advance: true,
    })
  end
end
