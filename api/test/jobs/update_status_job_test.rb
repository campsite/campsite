# frozen_string_literal: true

require "test_helper"

class UpdateStatusJobTest < ActiveJob::TestCase
  context "perform" do
    test "it calls pusher with payload" do
      organization = create(:organization)
      member = create(:organization_membership, organization: organization)
      to_member = create(:organization_membership, organization: organization)

      member.statuses.create!(emoji: "👍", message: "good", expires_at: 30.minutes.from_now)

      payload = {
        org: member.organization.slug,
        member_username: member.user.username,
        status: OrganizationMembershipStatusSerializer.render_as_hash(member.latest_status),
      }

      Pusher.expects(:trigger).with(to_member.user.channel_name, "update-status", payload, {})

      UpdateStatusJob.new.perform(member.id)
    end

    test "it calls pusher with null payload" do
      organization = create(:organization)
      member = create(:organization_membership, organization: organization)
      to_member = create(:organization_membership, organization: organization)

      payload = {
        org: member.organization.slug,
        member_username: member.user.username,
        status: nil,
      }

      Pusher.expects(:trigger).with(to_member.user.channel_name, "update-status", payload, {})

      UpdateStatusJob.new.perform(member.id)
    end
  end
end
