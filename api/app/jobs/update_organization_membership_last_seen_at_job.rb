# frozen_string_literal: true

class UpdateOrganizationMembershipLastSeenAtJob < BaseJob
  sidekiq_options queue: "background"

  def perform(organization_membership_id)
    organization_membership = OrganizationMembership.find(organization_membership_id)
    organization_membership.update!(last_seen_at: Time.current)
  end
end
