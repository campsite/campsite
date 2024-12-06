# frozen_string_literal: true

require "test_helper"

class UpdateOrganzationMembershipLastSeenAtJobTest < ActiveJob::TestCase
  setup do
    @member = create(:organization_membership, :member, last_seen_at: nil)
    @viewer = create(:organization_membership, :viewer, organization: @member.organization, last_seen_at: nil)
  end

  describe "#perform" do
    test "updates member's last_seen_at" do
      Timecop.freeze do
        UpdateOrganizationMembershipLastSeenAtJob.new.perform(@member.id)
        UpdateOrganizationMembershipLastSeenAtJob.new.perform(@viewer.id)

        assert_in_delta Time.current, @member.reload.last_seen_at, 2.seconds
        assert_in_delta Time.current, @viewer.reload.last_seen_at, 2.seconds
      end
    end
  end
end
