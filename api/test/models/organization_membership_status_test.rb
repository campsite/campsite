# frozen_string_literal: true

require "test_helper"

class OrganizationMembershipStatusTest < ActiveSupport::TestCase
  context "#destroy" do
    test "can be destroyed after organization membership is destroyed" do
      status = create(:organization_membership_status, pause_notifications: true, expires_at: 1.day.ago)
      status.organization_membership.destroy!
      status.reload

      status.destroy!

      assert_not OrganizationMembershipStatus.exists?(status.id)
    end
  end
end
