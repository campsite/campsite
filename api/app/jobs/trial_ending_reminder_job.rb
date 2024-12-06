# frozen_string_literal: true

class TrialEndingReminderJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(organization_id)
    organization = Organization.find_by(id: organization_id)
    return if !organization ||
      organization.paid? ||
      !organization.trial_ends_at ||
      organization.trial_ends_at.before?(Time.current) ||
      organization.trial_ends_at.after?(Organization::TRIAL_ENDING_REMINDER_LEAD_TIME.from_now)

    organization.admin_memberships.each do |admin_membership|
      OrganizationMailer.trial_ending_reminder(admin_membership).deliver_later
    end
  end
end
