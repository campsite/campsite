# frozen_string_literal: true

require "test_helper"
require "test_helpers/slack_test_helper"

module Api
  module V1
    module Integrations
      module Stripe
        class BillingPortalSessionsControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @admin_member = create(:organization_membership)
            @organization = @admin_member.organization
            @stripe_billing_portal_url = "https://checkout.stripe.com/c/pay/cs_test_foobar"
            ::Stripe::BillingPortal::Session.stubs(:create).returns(::Stripe::BillingPortal::Session.construct_from({ url: @stripe_billing_portal_url }))
          end

          describe "#create" do
            test "returns a Stripe billing portal URL" do
              sign_in @admin_member.user
              post organization_integrations_stripe_billing_portal_sessions_path(@organization.slug)

              assert_response :created
              assert_response_gen_schema
              assert_equal @stripe_billing_portal_url, json_response["url"]
            end

            test "returns forbidden for non-admin" do
              sign_in create(:organization_membership, :member, organization: @organization).user
              post organization_integrations_stripe_billing_portal_sessions_path(@organization.slug)

              assert_response :forbidden
            end

            test "returns forbidden for non-organization member" do
              sign_in create(:user)
              post organization_integrations_stripe_billing_portal_sessions_path(@organization.slug)

              assert_response :forbidden
            end

            test "returns unauthorized for logged-out user" do
              post organization_integrations_stripe_billing_portal_sessions_path(@organization.slug)

              assert_response :unauthorized
            end
          end
        end
      end
    end
  end
end
