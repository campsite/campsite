# frozen_string_literal: true

require "test_helper"

class TrialEndingReminderJobTest < ActiveJob::TestCase
  setup do
    @organization = create(:organization, trial_ends_at: Organization::TRIAL_ENDING_REMINDER_LEAD_TIME.from_now)
    @admin_member = create(:organization_membership, :admin, organization: @organization)
  end

  describe "#perform" do
    test "enqueues a trial ending reminder email" do
      TrialEndingReminderJob.new.perform(@organization.id)

      assert_enqueued_email_with OrganizationMailer, :trial_ending_reminder, args: [@admin_member]
    end

    test "does not enqueue a trial ending reminder email if the organization has been destroyed" do
      @organization.destroy!

      assert_no_enqueued_emails do
        TrialEndingReminderJob.new.perform(@organization.id)
      end
    end

    test "does not enqueue a trial ending reminder email if the organization has already upgraded" do
      @organization.update!(plan_name: Plan::PRO_NAME)

      assert_no_enqueued_emails do
        TrialEndingReminderJob.new.perform(@organization.id)
      end
    end

    test "does not enqueue a trial ending reminder email if the organization has no trial end date" do
      @organization.update!(trial_ends_at: nil)

      assert_no_enqueued_emails do
        TrialEndingReminderJob.new.perform(@organization.id)
      end
    end

    test "does not enqueue a trial ending reminder email if the trial end date is in the past" do
      @organization.update!(trial_ends_at: 1.day.ago)

      assert_no_enqueued_emails do
        TrialEndingReminderJob.new.perform(@organization.id)
      end
    end

    test "does not enqueue a trial ending reminder email if the trial end date is too far in the future" do
      @organization.update!(trial_ends_at: Organization::TRIAL_ENDING_REMINDER_LEAD_TIME.from_now + 1.day)

      assert_no_enqueued_emails do
        TrialEndingReminderJob.new.perform(@organization.id)
      end
    end
  end
end
