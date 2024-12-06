# frozen_string_literal: true

module StripeEvents
  class HandleCustomerUpdatedJob < BaseJob
    sidekiq_options queue: "background"

    def perform(event_params)
      event = Stripe::Event.construct_from(event_params)
      customer_email = event.data.object.email
      organization = Organization.find_by!(stripe_customer_id: event.data.object.id)
      organization.update!(billing_email: customer_email) if organization.billing_email != customer_email
    rescue ActiveRecord::RecordNotFound => e
      Sentry.capture_exception(e)
    end
  end
end
