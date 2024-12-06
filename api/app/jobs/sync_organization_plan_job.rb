# frozen_string_literal: true

class SyncOrganizationPlanJob < BaseJob
  sidekiq_options queue: "within_30_minutes"

  class MultipleActiveSubscriptionsError < StandardError; end

  def perform(organization_id)
    organization = Organization.find(organization_id)
    return unless organization.stripe_customer_id

    subscriptions = Stripe::Subscription
      .list(customer: organization.stripe_customer_id)
      .select { |subscription| subscription.status.in?(Organization::ACTIVE_SUBSCRIPTION_STATUSES) && subscription.items.any? }
    raise MultipleActiveSubscriptionsError, "Multiple active subscriptions found for #{organization.slug}" if subscriptions.size > 1

    organization.sync_with_stripe_subscription!(subscriptions.first)
  rescue ActiveRecord::RecordNotFound, MultipleActiveSubscriptionsError, Organization::MultiplePlanItemsError => e
    Sentry.capture_exception(e)
  end
end
