# frozen_string_literal: true

class ScheduledSubscriptionInvoiceMailer < ApplicationMailer
  self.mailer_name = "mailers/scheduled_subscription_invoice"

  def preview(scheduled_subscription_invoice, formatted_proration_amount)
    @scheduled_subscription_invoice = scheduled_subscription_invoice
    @organization = scheduled_subscription_invoice.organization
    @formatted_proration_amount = formatted_proration_amount

    campfire_mail(
      subject: "New member payment scheduled for next week",
      from: support_email,
      to: @organization.billing_email,
      tag: "scheduled-subscription-invoice-preview",
    )
  end
end
