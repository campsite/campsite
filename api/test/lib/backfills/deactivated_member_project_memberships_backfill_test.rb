# frozen_string_literal: true

require "test_helper"

module Backfills
  class DeactivatedMemberProjectMembershipsBackfillTest < ActiveSupport::TestCase
    describe ".run" do
      setup do
        @organization_membership = create(:organization_membership)
        create(:project_membership, organization_membership: @organization_membership)
      end

      it "discards project memberships for deactivated members" do
        @organization_membership.update!(discarded_at: Time.current)
        DeactivatedMemberProjectMembershipsBackfill.run(dry_run: false)

        assert_equal 0, @organization_membership.kept_project_memberships.count
      end

      it "doesn't discard project memberships for active members" do
        DeactivatedMemberProjectMembershipsBackfill.run(dry_run: false)

        assert_equal 1, @organization_membership.kept_project_memberships.count
      end

      it "skips discarding project memberships during dry run" do
        @organization_membership.update!(discarded_at: Time.current)
        DeactivatedMemberProjectMembershipsBackfill.run(dry_run: true)

        assert_equal 1, @organization_membership.kept_project_memberships.count
      end
    end
  end
end
