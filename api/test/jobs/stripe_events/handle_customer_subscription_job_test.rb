# frozen_string_literal: true

require "test_helper"
require "test_helpers/stripe_test_helper"

module StripeEvents
  class HandleCustomerSubscriptionJobTest < ActiveJob::TestCase
    include StripeTestHelper

    before(:each) do
      @event = Stripe::Event.construct_from(JSON.parse(file_fixture("stripe/customer_subscription_updated_event_payload.json").read, symbolize_names: true))
      @organization = create(:organization, stripe_customer_id: @event.data.object.customer)
    end

    context "#perform" do
      test "updates an org's plan from free to legacy when Stripe product belongs to legacy plan" do
        Plan.stub_const(:ALL_BY_STRIPE_PRODUCT_ID, { @event.data.object.items.first.price.product => Plan.by_name!(Plan::LEGACY_NAME) }) do
          HandleCustomerSubscriptionJob.new.perform(@event.as_json)
        end

        assert_equal Plan.by_name!(Plan::LEGACY_NAME), @organization.reload.plan
      end

      test "updates an org's plan from free to starter when Stripe product belongs to essentials plan" do
        Stripe::SubscriptionItem.stubs(:update)

        Plan.stub_const(:ALL_BY_STRIPE_PRODUCT_ID, { @event.data.object.items.first.price.product => Plan.by_name!(Plan::ESSENTIALS_NAME) }) do
          HandleCustomerSubscriptionJob.new.perform(@event.as_json)
        end

        assert_equal Plan.by_name!(Plan::ESSENTIALS_NAME), @organization.reload.plan
      end

      test "updates an org's plan from legacy to free when Stripe product belongs to free plan" do
        @organization.update!(plan_name: Plan::LEGACY_NAME)

        Plan.stub_const(:ALL_BY_STRIPE_PRODUCT_ID, { @event.data.object.items.first.price.product => Plan.by_name!(Plan::FREE_NAME) }) do
          HandleCustomerSubscriptionJob.new.perform(@event.as_json)
        end

        assert_equal Plan.by_name!(Plan::FREE_NAME), @organization.reload.plan
      end

      test "updates an org's plan from legacy to free when subscription is canceled" do
        @organization.update!(plan_name: Plan::LEGACY_NAME)
        @event.data.object.status = "canceled"

        HandleCustomerSubscriptionJob.new.perform(@event.as_json)

        assert_equal Plan.by_name!(Plan::FREE_NAME), @organization.reload.plan
      end

      test "updates an org's plan from legacy to free when subscription has no items" do
        @organization.update!(plan_name: Plan::LEGACY_NAME)
        @event.data.object.items.data = []

        HandleCustomerSubscriptionJob.new.perform(@event.as_json)

        assert_equal Plan.by_name!(Plan::FREE_NAME), @organization.reload.plan
      end

      test "creates an SSO plan add-on" do
        legacy_item = stripe_subscription_item(product: Plan.by_name!(Plan::LEGACY_NAME).stripe_product_ids.first)
        sso_item = stripe_subscription_item(product: PlanAddOn.by_name!(PlanAddOn::SSO_NAME).stripe_product_ids.first)
        @event.data.object.items.data = [legacy_item, sso_item]

        HandleCustomerSubscriptionJob.new.perform(@event.as_json)

        assert_equal Plan.by_name!(Plan::LEGACY_NAME), @organization.reload.plan
        assert_equal [PlanAddOn.by_name!(PlanAddOn::SSO_NAME)], @organization.plan_add_ons
      end

      test "no-op when organization not found" do
        @organization.update!(stripe_customer_id: "fake_customer_id")

        assert_no_changes -> { @organization.reload.plan } do
          HandleCustomerSubscriptionJob.new.perform(@event.as_json)
        end
      end
    end
  end
end
