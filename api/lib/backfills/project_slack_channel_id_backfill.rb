# frozen_string_literal: true

module Backfills
  class ProjectSlackChannelIdBackfill
    def self.run(dry_run: true, organization_slug: nil)
      updated_organizations_count = 0
      updated_projects_count = 0

      organizations = if organization_slug
        Organization.where(slug: organization_slug).where.not(slack_channel_id: nil)
      else
        Organization.where.not(slack_channel_id: nil)
      end

      organizations.find_each do |organization|
        updated_organizations_count += 1
        projects = organization.projects.where(slack_channel_id: nil).where(private: false)
        projects.update_all(slack_channel_id: organization.slack_channel_id) unless dry_run
        updated_projects_count += projects.count
      end

      "#{dry_run ? "Would have updated" : "updated"} #{updated_organizations_count} organizations and #{updated_projects_count} projects"
    end
  end
end
