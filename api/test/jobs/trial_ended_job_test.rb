# frozen_string_literal: true

require "test_helper"

class TrialEndedJobTest < ActiveJob::TestCase
  setup do
    @organization = create(:organization, trial_ends_at: 1.second.ago)
    @admin_member = create(:organization_membership, :admin, organization: @organization)
  end

  describe "#perform" do
    test "enqueues a trial ending reminder email" do
      TrialEndedJob.new.perform(@organization.id)

      assert_enqueued_email_with OrganizationMailer, :trial_ended, args: [@admin_member]
    end

    test "does not enqueue a trial ending reminder email if the organization has been destroyed" do
      @organization.destroy!

      assert_no_enqueued_emails do
        TrialEndedJob.new.perform(@organization.id)
      end
    end

    test "does not enqueue a trial ending reminder email if the organization has already upgraded" do
      @organization.update!(plan_name: Plan::PRO_NAME)

      assert_no_enqueued_emails do
        TrialEndedJob.new.perform(@organization.id)
      end
    end

    test "does not enqueue a trial ending reminder email if the organization has no trial end date" do
      @organization.update!(trial_ends_at: nil)

      assert_no_enqueued_emails do
        TrialEndedJob.new.perform(@organization.id)
      end
    end

    test "does not enqueue a trial ending reminder email is in the future" do
      @organization.update!(trial_ends_at: 1.day.from_now)

      assert_no_enqueued_emails do
        TrialEndedJob.new.perform(@organization.id)
      end
    end
  end
end
