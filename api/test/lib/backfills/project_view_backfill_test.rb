# frozen_string_literal: true

require "test_helper"

module Backfills
  class ProjectViewBackfillTest < ActiveSupport::TestCase
    setup do
      @project = create(:project)
    end

    describe ".run" do
      it "creates ProjectView records from Favorite and ProjectMembership records" do
        Timecop.freeze do
          favorite = create(:favorite, favoritable: @project, created_at: 10.minutes.ago)
          project_membership = create(:project_membership, project: @project, created_at: 5.minutes.ago)

          assert_difference "ProjectView.count", 2 do
            ProjectViewBackfill.run(dry_run: false)
          end

          favorite_project_view = ProjectView.find_by(project: @project, organization_membership: favorite.organization_membership)
          assert_in_delta Time.current, favorite_project_view.last_viewed_at, 2.seconds

          project_membership_project_view = ProjectView.find_by(project: @project, organization_membership: project_membership.organization_membership)
          assert_in_delta Time.current, project_membership_project_view.last_viewed_at, 2.seconds
        end
      end

      it "only creates ProjectView records for a specific org if specified" do
        organization = create(:organization)
        in_org_favorite = create(:favorite, favoritable: @project, organization_membership: create(:organization_membership, organization: organization))
        out_of_org_favorite = create(:favorite, favoritable: @project)

        assert_difference "ProjectView.count", 1 do
          ProjectViewBackfill.run(dry_run: false, organization_slug: organization.slug)
        end

        assert ProjectView.exists?(project: @project, organization_membership: in_org_favorite.organization_membership)
        assert_not ProjectView.exists?(project: @project, organization_membership: out_of_org_favorite.organization_membership)
      end

      it "does not create or modify ProjectView records if they already exist" do
        favorite = create(:favorite, favoritable: @project)
        create(:project_view, project: @project, organization_membership: favorite.organization_membership)
        project_membership = create(:project_membership, project: @project)
        create(:project_view, project: @project, organization_membership: project_membership.organization_membership)

        assert_no_difference "ProjectView.count" do
          ProjectViewBackfill.run(dry_run: false)
        end
      end

      it "dry run is a no-op" do
        favorite = create(:favorite, favoritable: @project, created_at: 10.minutes.ago)
        project_membership = create(:project_membership, project: @project, created_at: 5.minutes.ago)

        assert_no_difference "ProjectView.count" do
          ProjectViewBackfill.run
        end

        assert_not ProjectView.exists?(project: @project, organization_membership: favorite.organization_membership, last_viewed_at: favorite.created_at)
        assert_not ProjectView.exists?(project: @project, organization_membership: project_membership.organization_membership, last_viewed_at: project_membership.created_at)
      end
    end
  end
end
