# frozen_string_literal: true

module Backfills
  class PostNoteRevertBackfill
    def self.run(dry_run: true, org_slug:)
      updated_notes_count = 0
      updated_comments_count = 0
      updated_attachments_count = 0

      scope = Note.where.not(original_project_id: nil)
        .joins(member: :organization)
        .where(organizations: { slug: org_slug })

      scope.each do |note|
        parsed_description = Nokogiri::HTML.fragment(note.description_html)

        # check if the HTML contains any note-specific features
        has_any_note_features = ["span[commentid]", "post-attachment", "post-reference", "note-attachment"].any? do |sel|
          parsed_description.css(sel).any?
        end

        post = Post.find_by(unfurled_link: note.url)

        if post.nil?
          Rails.logger.info("Note #{note.id} has no post")
          next
        end

        # if there are no note features, move this back to a post
        if has_any_note_features
          # original_post_id was added in the process of building the backfill. make sure its set.
          note.update_columns(original_post_id: post.id) unless dry_run
          next
        end

        updated_notes_count += 1

        if note.title.present?
          if parsed_description.children.any?
            parsed_description.children.first.add_previous_sibling("<p><strong>#{note.title}</strong></p>")
          else
            parsed_description.add_child("<p><strong>#{note.title}</strong></p>")
          end
        end

        ActiveRecord::Base.transaction do
          unless dry_run
            post.update_columns(
              description_html: parsed_description.to_s,
              unfurled_link: nil,
            )
          end

          attachment_scope = Attachment.where(subject: note)
          updated_attachments_count += dry_run ? attachment_scope.size : attachment_scope.update_all(subject_type: Post, subject_id: post.id)

          comment_scope = Comment.where(subject: note)
          updated_comments_count += dry_run ? comment_scope.size : comment_scope.update_all(subject_type: Post, subject_id: post.id)

          note.destroy! unless dry_run
        end
      end

      "#{dry_run ? "Would have updated" : "updated"} #{updated_notes_count} notes, #{updated_comments_count} comments, and #{updated_attachments_count} attachments"
    end
  end
end
