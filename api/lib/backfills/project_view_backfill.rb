# frozen_string_literal: true

module Backfills
  class ProjectViewBackfill
    def self.run(dry_run: true, organization_slug: nil)
      organization = Organization.find_by!(slug: organization_slug) if organization_slug

      favorites = Favorite
        .joins(:organization_membership)
        .where(favoritable_type: "Project")
        .where("NOT EXISTS (SELECT 1 FROM project_views WHERE project_views.organization_membership_id = favorites.organization_membership_id AND project_views.project_id = favorites.favoritable_id)")

      if organization
        favorites = favorites.joins(:organization_membership).where(organization_memberships: { organization: organization })
      end

      project_memberships = ProjectMembership
        .joins(:organization_membership)
        .where("NOT EXISTS (SELECT 1 FROM project_views WHERE project_views.organization_membership_id = project_memberships.organization_membership_id AND project_views.project_id = project_memberships.project_id)")

      if organization
        project_memberships = project_memberships.joins(:organization_membership).where(organization_memberships: { organization: organization })
      end

      project_id_org_membership_id_pairs = (favorites.pluck(:favoritable_id, :organization_membership_id) + project_memberships.pluck(:project_id, :organization_membership_id)).uniq
      count = project_id_org_membership_id_pairs.count

      project_id_org_membership_id_pairs.each do |(project_id, organization_membership_id)|
        ProjectView.create!(project_id: project_id, organization_membership_id: organization_membership_id, last_viewed_at: Time.current) unless dry_run
      end

      "#{dry_run ? "Would have created" : "Created"} #{count} ProjectView #{"record".pluralize(count)}"
    end
  end
end
