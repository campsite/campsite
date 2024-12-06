# frozen_string_literal: true

module Backfills
  class PostAuthorViewBackfill
    def self.run(dry_run: true)
      updated_posts = 0

      no_views = <<~SQL.squish
        NOT EXISTS (
          SELECT 1 FROM post_views WHERE post_views.post_id = posts.id AND post_views.organization_membership_id = posts.organization_membership_id
        )
      SQL

      posts = Post.left_outer_joins(:views).where(no_views).distinct

      posts.find_each do |post|
        unless dry_run
          post.views.create!(member: post.member, created_at: post.created_at, updated_at: post.updated_at)
        end
        updated_posts += 1
      end

      "#{dry_run ? "Would have updated" : "updated"} #{updated_posts} posts"
    end
  end
end
