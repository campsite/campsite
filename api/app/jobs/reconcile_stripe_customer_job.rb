# frozen_string_literal: true

class ReconcileStripeCustomerJob < BaseJob
  sidekiq_options queue: "background"

  def perform(id)
    org = Organization.find(id)
    attrs = {
      email: org.billing_email,
      name: org.name,
      description: org.name,
      metadata: {
        public_id: org.public_id,
        db_id: org.id,
      },
    }

    if org.stripe_customer_id
      Stripe::Customer.update(org.stripe_customer_id, attrs)
    else
      customer = Stripe::Customer.create(attrs)
      org.update!(stripe_customer_id: customer.id)
    end
  end
end
