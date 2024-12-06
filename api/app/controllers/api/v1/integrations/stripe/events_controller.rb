# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Stripe
        class EventsController < BaseController
          skip_before_action :require_authenticated_user, only: :create
          skip_before_action :require_authenticated_organization_membership, only: :create

          rescue_from ::Stripe::SignatureVerificationError, with: :render_unprocessable_entity

          def create
            event = ::Stripe::Webhook.construct_event(
              request.body.read,
              request.env["HTTP_STRIPE_SIGNATURE"],
              Rails.application.credentials.stripe.webhook_signing_secret,
            )

            case event.type
            when /^customer\.subscription\./
              StripeEvents::HandleCustomerSubscriptionJob.perform_async(event.as_json)
            when "customer.updated"
              StripeEvents::HandleCustomerUpdatedJob.perform_async(event.as_json)
            end

            render_ok
          end
        end
      end
    end
  end
end
