# frozen_string_literal: true

require "test_helper"

module Backfills
  class OrganizationMembershipLastSeenAtBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      setup do
        @member = create(:organization_membership, last_seen_at: nil)
      end

      it "sets last_seen_at for a member with a post view" do
        Timecop.freeze do
          post_view_timestamp = 10.minutes.ago
          @member.post_views.create!(post: create(:post, organization: @member.organization), created_at: 2.days.ago)
          @member.post_views.create!(post: create(:post, organization: @member.organization), created_at: post_view_timestamp)

          OrganizationMembershipLastSeenAtBackfill.run(dry_run: false)

          assert_in_delta post_view_timestamp, @member.reload.last_seen_at, 2.seconds
        end
      end

      it "does not set last_seen_at for a member without a post view" do
        OrganizationMembershipLastSeenAtBackfill.run(dry_run: false)

        assert_nil @member.reload.last_seen_at
      end

      it "dry run is a no-op" do
        @member.post_views.create!(post: create(:post, organization: @member.organization))

        OrganizationMembershipLastSeenAtBackfill.run

        assert_nil @member.reload.last_seen_at
      end
    end
  end
end
