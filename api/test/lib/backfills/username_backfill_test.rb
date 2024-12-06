# frozen_string_literal: true

require "test_helper"

module Backfills
  class UsernameBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      it "dry run is a no-op" do
        user = create(:user)
        user.update_column(:username, nil)
        create(:user)

        UsernameBackfill.run

        user.reload
        assert_nil user.username
      end

      it "sets the user's usernames and doesn't update usernames for users that already have them" do
        user = create(:user)
        user.update_column(:username, nil)
        user2 = create(:user)
        user2.update_column(:username, "my_own_made_up_name")

        UsernameBackfill.run(dry_run: false)

        assert_equal user.email.split("@").first.underscore, user.reload.username
        assert_equal "my_own_made_up_name", user2.reload.username
      end
    end
  end
end
