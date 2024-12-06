# frozen_string_literal: true

require "test_helper"

module Backfills
  class ProjectMembershipBackfillTest < ActiveSupport::TestCase
    setup do
      @organization_membership = create(:organization_membership)
      @organization = @organization_membership.organization
      @project = create(:project, organization: @organization)
      @permission = create(:permission, user: @organization_membership.user, subject: @project, action: :view)
    end

    describe ".run" do
      it "creates a ProjectMembership record from a Permission record" do
        assert_difference "ProjectMembership.count", 1 do
          ProjectMembershipBackfill.run(dry_run: false)
        end

        assert @project.kept_project_memberships.exists?(organization_membership: @organization_membership)
      end

      it "does not create a ProjectMembership record if the Permission record is discarded" do
        @permission.discard

        assert_no_difference "ProjectMembership.count" do
          ProjectMembershipBackfill.run(dry_run: false)
        end
      end

      it "un-discards a ProjectMembership record from a Permission record" do
        create(:project_membership, project: @project, organization_membership: @organization_membership, discarded_at: 1.day.ago)

        assert_no_difference "ProjectMembership.count" do
          ProjectMembershipBackfill.run(dry_run: false)
        end

        assert @project.kept_project_memberships.exists?(organization_membership: @organization_membership)
      end

      it "is a no-op if the ProjectMembership already exists" do
        create(:project_membership, project: @project, organization_membership: @organization_membership)

        assert_no_difference "ProjectMembership.count" do
          ProjectMembershipBackfill.run(dry_run: false)
        end
      end

      it "dry run is a no-op" do
        assert_no_difference "ProjectMembership.count" do
          ProjectMembershipBackfill.run
        end
      end
    end
  end
end
