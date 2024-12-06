# frozen_string_literal: true

module StripeEvents
  class HandleCustomerSubscriptionJob < BaseJob
    sidekiq_options queue: "background"

    def perform(event_params)
      event = Stripe::Event.construct_from(event_params)
      organization = Organization.find_by!(stripe_customer_id: event.data.object.customer)
      organization.sync_with_stripe_subscription!(event.data.object)
    rescue ActiveRecord::RecordNotFound => e
      Sentry.capture_exception(e)
    end
  end
end
