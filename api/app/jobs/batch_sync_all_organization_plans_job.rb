# frozen_string_literal: true

class BatchSyncAllOrganizationPlansJob < BaseJob
  sidekiq_options queue: "within_30_minutes"

  def perform
    OrganizationMembership.counter_culture_fix_counts(only: :organization)

    Organization.find_in_batches(batch_size: 100).with_index do |organizations, batch_index|
      organizations.each do |organization|
        SyncOrganizationPlanJob.perform_in(batch_index.minutes, organization.id)
      end
    end

    ScheduledSubscriptionInvoice.due.find_each do |scheduled_subscription_invoice|
      SubscriptionInvoiceJob.perform_async(scheduled_subscription_invoice.id)
    end
  end
end
