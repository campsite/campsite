# frozen_string_literal: true

require "test_helper"
require "test_helpers/stripe_test_helper"

class SyncOrganizationPlanJobTest < ActiveJob::TestCase
  include StripeTestHelper

  setup do
    @organization = create(:organization, :stripe_customer)
    @active_legacy_subscription = stripe_subscription(
      status: "active",
      items: [stripe_subscription_item(product: Plan.by_name!(Plan::LEGACY_NAME).stripe_product_ids.first)],
    )
    @canceled_legacy_subscription = stripe_subscription(
      status: "canceled",
      items: [stripe_subscription_item(product: Plan.by_name!(Plan::LEGACY_NAME).stripe_product_ids.first)],
    )
    @empty_subscription = stripe_subscription(
      status: "active",
      items: [],
    )
    @active_pro_subscription = stripe_subscription(
      status: "active",
      items: [stripe_subscription_item(product: Plan.by_name!(Plan::PRO_NAME).stripe_product_ids.first)],
    )
  end

  describe "#perform" do
    test "updates an org's plan from free to legacy when Stripe product belongs to legacy plan" do
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [@active_legacy_subscription] }))

      SyncOrganizationPlanJob.new.perform(@organization.id)

      assert_equal Plan.by_name!(Plan::LEGACY_NAME), @organization.reload.plan
    end

    test "updates an org's plan from legacy to free when subscription is canceled" do
      @organization.update!(plan_name: Plan::LEGACY_NAME, plan_add_ons: [PlanAddOn.by_name!(PlanAddOn::SSO_NAME)])
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [@canceled_legacy_subscription] }))

      SyncOrganizationPlanJob.new.perform(@organization.id)

      assert_equal Plan.by_name!(Plan::FREE_NAME), @organization.reload.plan
      assert_predicate @organization.reload.plan_add_ons, :empty?
    end

    test "updates an org's plan from legacy to free when org has no subscriptions" do
      @organization.update!(plan_name: Plan::LEGACY_NAME)
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [] }))

      SyncOrganizationPlanJob.new.perform(@organization.id)

      assert_equal Plan.by_name!(Plan::FREE_NAME), @organization.reload.plan
    end

    test "updates an org's plan from legacy to free when subscription has no items" do
      @organization.update!(plan_name: Plan::LEGACY_NAME)
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [@empty_subscription] }))

      SyncOrganizationPlanJob.new.perform(@organization.id)

      assert_equal Plan.by_name!(Plan::FREE_NAME), @organization.reload.plan
    end

    test "updates an org's plan from free to legacy when org has multiple subscriptions but only one valid" do
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [@active_legacy_subscription, @canceled_legacy_subscription, @empty_subscription] }))

      SyncOrganizationPlanJob.new.perform(@organization.id)

      assert_equal Plan.by_name!(Plan::LEGACY_NAME), @organization.reload.plan
    end

    test "updates an org's pro plan subscription quantity when active users has changed" do
      new_active_user_count = 5
      create_list(:organization_membership, new_active_user_count, :active, organization: @organization)
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [@active_pro_subscription] }))
      Stripe::SubscriptionItem.expects(:update).with(@active_pro_subscription.items.data.first.id, { quantity: new_active_user_count })

      SyncOrganizationPlanJob.new.perform(@organization.id)
    end

    test "does not update an org's pro plan subscription quantity when active users has not changed" do
      new_active_user_count = @active_pro_subscription.items.data.first.quantity
      create_list(:organization_membership, new_active_user_count, :active, organization: @organization)
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [@active_pro_subscription] }))
      Stripe::SubscriptionItem.expects(:update).never

      SyncOrganizationPlanJob.new.perform(@organization.id)
    end

    test "does not update an org's legacy plan subscription quantity" do
      new_active_user_count = 5
      create_list(:organization_membership, new_active_user_count, :active, organization: @organization)
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [@active_legacy_subscription] }))
      Stripe::SubscriptionItem.expects(:update).never

      SyncOrganizationPlanJob.new.perform(@organization.id)
    end

    test "enqueues a job to true-up an org's annual subscription on the pro plan" do
      subscription = stripe_subscription(items: [stripe_subscription_item(product: Plan.by_name!(Plan::PRO_NAME).stripe_product_ids.first, interval: "year")])
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [subscription] }))
      Stripe::SubscriptionItem.stubs(:update)
      AnnualSubscriptionTrueUpJob.expects(:perform_async).with(@organization.id, subscription.id)

      SyncOrganizationPlanJob.new.perform(@organization.id)
    end

    test "does not enqueue a job to true-up an org's annual subscription if the subscription has been canceled" do
      subscription = stripe_subscription(items: [stripe_subscription_item(product: Plan.by_name!(Plan::PRO_NAME).stripe_product_ids.first, interval: "year")], cancel_at_period_end: true)
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [subscription] }))
      Stripe::SubscriptionItem.stubs(:update)
      AnnualSubscriptionTrueUpJob.expects(:perform_async).never

      SyncOrganizationPlanJob.new.perform(@organization.id)
    end

    test "does not enqueue a job to true-up an org's annual subscription on the legacy plan" do
      subscription = stripe_subscription(items: [stripe_subscription_item(product: Plan.by_name!(Plan::LEGACY_NAME).stripe_product_ids.first, interval: "year")])
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [subscription] }))
      AnnualSubscriptionTrueUpJob.expects(:perform_async).never

      SyncOrganizationPlanJob.new.perform(@organization.id)
    end

    test "does not enqueue a true-up job for a monthly subscription" do
      subscription = stripe_subscription(items: [stripe_subscription_item(product: Plan.by_name!(Plan::PRO_NAME).stripe_product_ids.first, interval: "month")])
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [subscription] }))
      Stripe::SubscriptionItem.stubs(:update)
      AnnualSubscriptionTrueUpJob.expects(:perform_async).never

      SyncOrganizationPlanJob.new.perform(@organization.id)
    end

    test "does not enqueue a true-up job for a trial subscription" do
      subscription = stripe_subscription(items: [stripe_subscription_item(product: Plan.by_name!(Plan::PRO_NAME).stripe_product_ids.first, interval: "year")], status: "trialing")

      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [subscription] }))
      Stripe::SubscriptionItem.stubs(:update)
      AnnualSubscriptionTrueUpJob.expects(:perform_async).never

      SyncOrganizationPlanJob.new.perform(@organization.id)
    end

    test "no-ops if organization has multiple active subscriptions" do
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [@active_legacy_subscription, @active_legacy_subscription] }))

      SyncOrganizationPlanJob.new.perform(@organization.id)

      assert_equal Plan.by_name!(Plan::FREE_NAME), @organization.reload.plan
    end

    test "no-ops if subscription has multiple subscription items" do
      subscription = stripe_subscription(
        status: "active",
        items: [stripe_subscription_item(product: Plan.by_name!(Plan::LEGACY_NAME).stripe_product_ids.first), stripe_subscription_item(product: Plan.by_name!(Plan::LEGACY_NAME).stripe_product_ids.second)],
      )
      Stripe::Subscription.expects(:list).returns(Stripe::ListObject.construct_from({ data: [subscription] }))

      SyncOrganizationPlanJob.new.perform(@organization.id)

      assert_equal Plan.by_name!(Plan::FREE_NAME), @organization.reload.plan
    end

    test "no-ops if organization not found" do
      SyncOrganizationPlanJob.new.perform("not-an-id")

      assert_equal Plan.by_name!(Plan::FREE_NAME), @organization.reload.plan
    end
  end
end
