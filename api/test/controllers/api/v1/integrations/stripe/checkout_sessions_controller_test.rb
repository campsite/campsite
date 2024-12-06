# frozen_string_literal: true

require "test_helper"
require "test_helpers/slack_test_helper"

module Api
  module V1
    module Integrations
      module Stripe
        class CheckoutSessionsControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @admin_member = create(:organization_membership)
            @organization = @admin_member.organization
            @stripe_checkout_url = "https://checkout.stripe.com/c/pay/cs_test_foobar"
            ::Stripe::Checkout::Session.stubs(:create).returns(::Stripe::Checkout::Session.construct_from({ url: @stripe_checkout_url }))
          end

          describe "#create" do
            test "returns a Stripe checkout URL" do
              sign_in @admin_member.user
              post organization_integrations_stripe_checkout_sessions_path(@organization.slug, price: "pro_monthly")

              assert_response :created
              assert_response_gen_schema
              assert_equal @stripe_checkout_url, json_response["url"]
            end

            test "returns a Stripe checkout URL for essentials plan" do
              sign_in @admin_member.user
              post organization_integrations_stripe_checkout_sessions_path(@organization.slug, price: "essentials_monthly")

              assert_response :created
              assert_response_gen_schema
              assert_equal @stripe_checkout_url, json_response["url"]
            end

            test "returns unprocessable entity if price missing" do
              sign_in @admin_member.user
              post organization_integrations_stripe_checkout_sessions_path(@organization.slug)

              assert_response :unprocessable_entity
            end

            test "returns unprocessable entity if price invalid" do
              sign_in @admin_member.user
              post organization_integrations_stripe_checkout_sessions_path(@organization.slug, price: "not-a-valid-price")

              assert_response :unprocessable_entity
            end

            test "returns forbidden for non-admin" do
              sign_in create(:organization_membership, :member, organization: @organization).user
              post organization_integrations_stripe_checkout_sessions_path(@organization.slug, price: "pro_monthly")

              assert_response :forbidden
            end

            test "returns forbidden for non-organization member" do
              sign_in create(:user)
              post organization_integrations_stripe_checkout_sessions_path(@organization.slug, price: "pro_monthly")

              assert_response :forbidden
            end

            test "returns unauthorized for logged-out user" do
              post organization_integrations_stripe_checkout_sessions_path(@organization.slug, price: "pro_monthly")

              assert_response :unauthorized
            end
          end
        end
      end
    end
  end
end
