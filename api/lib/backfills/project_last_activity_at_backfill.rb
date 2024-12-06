# frozen_string_literal: true

module Backfills
  class ProjectLastActivityAtBackfill
    def self.run(dry_run: true)
      projects = Project
        .where(last_activity_at: nil)
        .joins(
          <<~SQL.squish,
            LEFT JOIN (
              SELECT project_id, MAX(created_at) AS max_created_at
              FROM posts
              WHERE posts.discarded_at IS NULL
              GROUP BY project_id
            ) latest_posts
            ON projects.id = latest_posts.project_id
          SQL
        )

      count = if dry_run
        projects.count
      else
        projects.update_all("last_activity_at = COALESCE(latest_posts.max_created_at, projects.created_at)")
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{count} t #{"record".pluralize(count)}"
    end
  end
end
