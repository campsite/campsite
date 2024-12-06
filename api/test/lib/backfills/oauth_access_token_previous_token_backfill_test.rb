# frozen_string_literal: true

require "test_helper"

module Backfills
  class OauthAccessTokenPreviousTokenBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      test "sets previous_token from token if previous_token is nil" do
        access_token = create(:access_token, previous_token: nil)

        OauthAccessTokenPreviousTokenBackfill.run(dry_run: false)

        access_token.reload
        assert_equal access_token.previous_token, access_token.token
      end

      test "does not touch previous_token for if previous_token is non-nil" do
        access_token = create(:access_token, previous_token: "foobar")

        OauthAccessTokenPreviousTokenBackfill.run(dry_run: false)

        access_token.reload
        assert_not_equal access_token.previous_token, access_token.token
      end

      test "dry run is a no-op" do
        access_token = create(:access_token, previous_token: nil)

        OauthAccessTokenPreviousTokenBackfill.run

        access_token.reload
        assert_nil access_token.previous_token
      end
    end
  end
end
