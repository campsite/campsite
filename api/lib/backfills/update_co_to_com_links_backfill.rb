# frozen_string_literal: true

module Backfills
  class UpdateCoToComLinksBackfill
    OLD_DOMAIN = "https://app.campsite.co/"
    NEW_DOMAIN = "https://app.campsite.com/"

    def self.run(dry_run: true)
      updated_posts_count = 0
      updated_comments_count = 0
      updated_notes_count = 0

      like_query = "LIKE '%href=\"#{OLD_DOMAIN}%'"

      Post.where("description_html #{like_query}").find_in_batches(batch_size: 20).with_index do |batch, index|
        batch.each do |post|
          UpdateCoToComLinkJob.perform_in(index * 10.seconds, post.id, "Post") unless dry_run
        end
        updated_posts_count += batch.size
      end

      Comment.where("body_html #{like_query}").find_in_batches(batch_size: 20).with_index do |batch, index|
        batch.each do |comment|
          UpdateCoToComLinkJob.perform_in(index * 10.seconds + 3.seconds, comment.id, "Comment") unless dry_run
        end
        updated_comments_count += batch.size
      end

      Note.where("description_html #{like_query}").find_in_batches(batch_size: 20).with_index do |batch, index|
        batch.each do |note|
          UpdateCoToComLinkJob.perform_in(index * 10.seconds + 6.seconds, note.id, "Note") unless dry_run
        end
        updated_notes_count += batch.size
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{updated_posts_count} posts, #{updated_comments_count} comments, and #{updated_notes_count} notes"
    end
  end
end
