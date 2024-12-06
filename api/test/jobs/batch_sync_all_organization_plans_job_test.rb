# frozen_string_literal: true

require "test_helper"
require "test_helpers/stripe_test_helper"

class BatchSyncAllOrganizationPlansJobTest < ActiveJob::TestCase
  include StripeTestHelper

  setup do
    @organization = create(:organization, :stripe_customer)
  end

  describe "#perform" do
    test "enqueues a SyncOrganizationPlansJob for each organization" do
      BatchSyncAllOrganizationPlansJob.new.perform

      assert_enqueued_sidekiq_job(SyncOrganizationPlanJob, args: [@organization.id])
    end

    test "updates member_counts" do
      membership_1, membership_2, membership_3, membership_4 = create_list(:organization_membership, 4, :active, organization: @organization)
      membership_1.update_column(:last_seen_at, 31.days.ago)
      membership_2.update_column(:discarded_at, Time.current)
      membership_3.update_column(:role_name, Role::VIEWER_NAME)
      membership_4.user.update_columns(staff: true)
      assert_equal 4, @organization.reload.member_count

      BatchSyncAllOrganizationPlansJob.new.perform

      assert_equal 1, @organization.reload.member_count
    end

    test "enqueues a SubscriptionInvoiceJob for each scheduled subscription invoice" do
      due = create(:scheduled_subscription_invoice, :due)
      create(:scheduled_subscription_invoice, :not_due)
      create(:scheduled_subscription_invoice, :payment_attempted)

      BatchSyncAllOrganizationPlansJob.new.perform

      assert_enqueued_sidekiq_job(SubscriptionInvoiceJob, count: 1)
      assert_enqueued_sidekiq_job(SubscriptionInvoiceJob, args: [due.id])
    end
  end
end
