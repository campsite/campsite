# frozen_string_literal: true

module Backfills
  class RemoveClosureTreeBackfill
    def self.run(dry_run: true)
      updated_count = 0

      Post.where("parent_id IS NOT NULL or previous_parent_id IS NOT NULL").where(post_parent_id: nil).find_each do |post|
        post.update!(post_parent_id: post.parent_id || post.previous_parent_id) unless dry_run
        post.post_parent_id = post.parent_id || post.previous_parent_id
        updated_count += 1
      end

      # Do this in two separate steps so the whole parent tree is built
      updated_root_count = 0
      Post.where("post_parent_id IS NOT NULL and root_id IS NULL").find_each do |post|
        updated_root_count += 1
        # puts "Updating post #{updated_root_count}"
        post_parent = Post.find(post.post_parent_id)
        post_parent.update!(child_id: post.id, stale: true) unless dry_run

        # Find the root of the tree by walking up until we find a post with no parent
        root = post_parent
        while root.post_parent_id
          # puts "  while new root: #{root.post_parent_id}"
          root = Post.find(root.post_parent_id)
        end
        post.update!(root_id: root.id) unless dry_run
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{updated_count} posts and #{updated_root_count} roots"
    end
  end
end

# Backfills::RemoveClosureTreeBackfill.run(dry_run: false)
