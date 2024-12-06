# frozen_string_literal: true

class UpdateStatusJob < BaseJob
  sidekiq_options queue: "background", retry: 3

  def perform(membership_id)
    member = OrganizationMembership.includes(organization: [kept_memberships: :user]).find(membership_id)
    all_members = member.organization.kept_memberships

    payload = {
      org: member.organization.slug,
      member_username: member.user.username,
      status: member.latest_status&.active? ? OrganizationMembershipStatusSerializer.render_as_hash(member.latest_status) : nil,
    }

    all_members.each do |to_member|
      Pusher.trigger(
        to_member.user.channel_name,
        "update-status",
        payload,
        { socket_id: Current.pusher_socket_id }.compact,
      )
    end
  end
end
