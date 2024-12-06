# frozen_string_literal: true

class ScheduledSubscriptionInvoiceMailerPreview < ActionMailer::Preview
  def preview
    scheduled_subscription_invoice = ScheduledSubscriptionInvoice.new(
      organization: Organization.first,
      scheduled_for: 1.week.from_now,
    )

    ScheduledSubscriptionInvoiceMailer.preview(scheduled_subscription_invoice, "$10.00")
  end
end
