# frozen_string_literal: true

require "test_helper"

class BroadcastUserStaleJobTest < ActiveJob::TestCase
  setup do
    @user = create(:user)
  end

  context "perform" do
    test "sends Pusher events to each of the user's organization's channels" do
      organizations = create_list(:organization_membership, 2, user: @user).map(&:organization)

      BroadcastUserStaleJob.new.perform(@user.id)

      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [organizations.first.channel_name, "user-stale", { user: UserSerializer.render_as_hash(@user) }.to_json])
      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [organizations.second.channel_name, "user-stale", { user: UserSerializer.render_as_hash(@user) }.to_json])
    end

    test "no-op if user deleted" do
      @user.destroy!

      assert_nothing_raised do
        BroadcastUserStaleJob.new.perform(@user.id)
      end

      refute_enqueued_sidekiq_job(PusherTriggerJob)
    end
  end
end
