# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Stripe
        class BillingPortalSessionsController < BaseController
          extend Apigen::Controller

          response model: StripeBillingPortalSessionSerializer, code: 201
          def create
            authorize(current_organization, :manage_billing?)

            session = ::Stripe::BillingPortal::Session.create({
              customer: current_organization.stripe_customer_id,
              return_url: current_organization.billing_settings_url,
            })

            render_json(StripeBillingPortalSessionSerializer, session, status: :created)
          end
        end
      end
    end
  end
end
