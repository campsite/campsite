# frozen_string_literal: true

module Backfills
  class PostLastActivityAtBackfill
    def self.run(dry_run: true)
      posts = Post
        .where(last_activity_at: nil)
        .joins(
          <<~SQL.squish,
            LEFT JOIN (
              SELECT subject_id, MAX(created_at) AS max_created_at
              FROM comments
              WHERE comments.discarded_at IS NULL AND comments.subject_type = 'Post'
              GROUP BY subject_id
            ) latest_comments
            ON posts.id = latest_comments.subject_id
          SQL
        )

      count = if dry_run
        posts.count
      else
        posts.in_batches(of: 10_000).update_all("last_activity_at = COALESCE(latest_comments.max_created_at, posts.created_at)")
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{count} Post #{"record".pluralize(count)}"
    end
  end
end
