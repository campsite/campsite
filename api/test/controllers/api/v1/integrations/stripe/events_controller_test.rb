# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Integrations
      module Stripe
        class EventsControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @timestamp = Time.zone.now
          end

          describe "#create" do
            test "handles customer.subscription.created events" do
              payload = file_fixture("stripe/customer_subscription_created_event_payload.json").read
              signature = ::Stripe::Webhook::Signature.compute_signature(@timestamp, payload, Rails.application.credentials.stripe.webhook_signing_secret)

              post stripe_integration_events_path,
                params: payload,
                headers: { "HTTP_STRIPE_SIGNATURE" => ::Stripe::Webhook::Signature.generate_header(@timestamp, signature) }

              assert_response :ok
              assert_enqueued_sidekiq_job(StripeEvents::HandleCustomerSubscriptionJob)
            end

            test "handles customer.subscription.updated events" do
              payload = file_fixture("stripe/customer_subscription_updated_event_payload.json").read
              signature = ::Stripe::Webhook::Signature.compute_signature(@timestamp, payload, Rails.application.credentials.stripe.webhook_signing_secret)

              post stripe_integration_events_path,
                params: payload,
                headers: { "HTTP_STRIPE_SIGNATURE" => ::Stripe::Webhook::Signature.generate_header(@timestamp, signature) }

              assert_response :ok
              assert_enqueued_sidekiq_job(StripeEvents::HandleCustomerSubscriptionJob)
            end

            test "handles customer.subscription.deleted events" do
              payload = file_fixture("stripe/customer_subscription_deleted_event_payload.json").read
              signature = ::Stripe::Webhook::Signature.compute_signature(@timestamp, payload, Rails.application.credentials.stripe.webhook_signing_secret)

              post stripe_integration_events_path,
                params: payload,
                headers: { "HTTP_STRIPE_SIGNATURE" => ::Stripe::Webhook::Signature.generate_header(@timestamp, signature) }

              assert_response :ok
              assert_enqueued_sidekiq_job(StripeEvents::HandleCustomerSubscriptionJob)
            end

            test "handles customer.updated events" do
              payload = file_fixture("stripe/customer_updated_event_payload.json").read
              signature = ::Stripe::Webhook::Signature.compute_signature(@timestamp, payload, Rails.application.credentials.stripe.webhook_signing_secret)

              post stripe_integration_events_path,
                params: payload,
                headers: { "HTTP_STRIPE_SIGNATURE" => ::Stripe::Webhook::Signature.generate_header(@timestamp, signature) }

              assert_response :ok
              assert_enqueued_sidekiq_job(StripeEvents::HandleCustomerUpdatedJob)
            end

            test "returns error if webhook signing secret is incorrect" do
              payload = file_fixture("stripe/customer_subscription_updated_event_payload.json").read
              signature = ::Stripe::Webhook::Signature.compute_signature(@timestamp, payload, "invalid-signing-secret")

              post stripe_integration_events_path,
                params: payload,
                headers: { "HTTP_STRIPE_SIGNATURE" => ::Stripe::Webhook::Signature.generate_header(@timestamp, signature) }

              assert_response :unprocessable_entity
            end
          end
        end
      end
    end
  end
end
