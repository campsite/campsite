# frozen_string_literal: true

require "test_helper"

class FavoriteTest < ActiveSupport::TestCase
  context "#broadcast_favorites_stale" do
    test "broadcasts stale favorites when favorite is destroyed" do
      favorite = create(:favorite)
      favorite.destroy!
      assert_enqueued_sidekiq_job(PusherTriggerJob, args: [favorite.user.channel_name, "favorites-stale", nil.to_json])
    end

    test "does not broadcast stale favorites when organization membership has been destroyed" do
      favorite = create(:favorite)
      favorite.organization_membership.destroy!

      assert_nothing_raised do
        favorite.reload.destroy!
      end
    end
  end
end
