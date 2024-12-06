# frozen_string_literal: true

require "test_helper"

class FollowUpTest < ActiveSupport::TestCase
  context "#broadcast_follow_ups_stale" do
    test "broadcasts stale follow ups when follow up is destroyed" do
      follow_up = create(:follow_up)
      follow_up.destroy!
      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [follow_up.user.channel_name, "follow-ups-stale", nil.to_json])
    end

    test "does not broadcast stale follow ups when organization membership has been destroyed" do
      follow_up = create(:follow_up)
      follow_up.organization_membership.destroy!

      assert_nothing_raised do
        follow_up.reload.destroy!
      end
    end
  end
end
