# frozen_string_literal: true

class TrialEndedJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(organization_id)
    organization = Organization.find_by(id: organization_id)
    return unless organization&.trial_ended?

    organization.admin_memberships.each do |admin_membership|
      OrganizationMailer.trial_ended(admin_membership).deliver_later
    end
  end
end
