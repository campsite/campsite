# frozen_string_literal: true

require "test_helper"

class AccessTokenTest < ActiveSupport::TestCase
  context "#broadcast_stale" do
    test "broadcasts stale event to owning user" do
      user = create(:user)
      create(:access_token, resource_owner: user)

      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [user.channel_name, "access-tokens-stale", nil.to_json])
    end
  end
end
