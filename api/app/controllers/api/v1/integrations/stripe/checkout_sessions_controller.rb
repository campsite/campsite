# frozen_string_literal: true

module Api
  module V1
    module Integrations
      module Stripe
        class CheckoutSessionsController < BaseController
          extend Apigen::Controller

          response model: StripeCheckoutSessionSerializer, code: 201
          request_params do
            {
              price: { type: :string, enum: StripePrice::NAMES },
            }
          end
          def create
            authorize(current_organization, :manage_billing?)
            price = StripePrice.by_name!(params[:price])

            session = ::Stripe::Checkout::Session.create({
              customer: current_organization.stripe_customer_id,
              mode: "subscription",
              line_items: [{ price: price, quantity: current_organization.member_count }],
              cancel_url: current_organization.billing_settings_url,
              success_url: current_organization.billing_settings_url,
            })

            render_json(StripeCheckoutSessionSerializer, session, status: :created)
          rescue KeyError
            render_error(status: :unprocessable_entity, message: "Price invalid")
          end
        end
      end
    end
  end
end
