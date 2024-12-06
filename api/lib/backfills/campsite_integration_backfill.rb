# frozen_string_literal: true

module Backfills
  class CampsiteIntegrationBackfill
    def self.run(dry_run: true)
      # Around 8/1/24 we created a "Campsite integration" for all new organizations, which is the author for all onboarding content.
      # This script backfills Campsite integrations for all existing orgs.
      # It also assigns the missing author to a handful of posts that were created for organizations that don't yet have a Campsite integration.

      organizations = Organization.includes(:integrations).where(integrations: { provider: nil }).or(
        Organization.includes(:integrations).where.not(integrations: { provider: "campsite" }),
      )

      org_count = organizations.count

      unless dry_run
        organizations.find_each do |organization|
          organization.create_campsite_integration
        end
      end

      posts_without_author = Post.where(oauth_application: nil, member: nil, integration: nil).includes(:organization)
      post_count = posts_without_author.count

      unless dry_run
        posts_without_author.find_each do |post|
          post.update(integration: post.organization.campsite_integration)
        end
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{org_count} Organization #{"record".pluralize(org_count)} and #{post_count} Post #{"record".pluralize(post_count)}"
    end
  end
end
