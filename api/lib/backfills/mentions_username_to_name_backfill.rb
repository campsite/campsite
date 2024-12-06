# frozen_string_literal: true

module Backfills
  class MentionsUsernameToNameBackfill
    def self.run(dry_run: true, organization_slug: nil)
      updated_posts_count = 0
      updated_comments_count = 0
      updated_notes_count = 0

      posts = organization_slug ? Post.joins(:organization).where(organizations: { slug: organization_slug }) : Post.all
      posts = posts.where("description_html LIKE ?", '%data-type="mention"%')
      posts.in_batches do |posts|
        posts.each do |post|
          new_description = update_mentions(Nokogiri::HTML.fragment(post.description_html))
          if new_description != post.description_html
            post.update_column(:description_html, new_description) unless dry_run
            updated_posts_count += 1
          end
        end
      end

      comments = organization_slug ? Comment.joins(member: :organization).where(member: { organizations: { slug: organization_slug } }) : Comment.all
      comments = comments.where("body_html LIKE ?", '%data-type="mention"%')
      comments.in_batches do |comments|
        comments.each do |comment|
          new_body = update_mentions(Nokogiri::HTML.fragment(comment.body_html))
          if new_body != comment.body_html
            comment.update_column(:body_html, new_body) unless dry_run
            updated_comments_count += 1
          end
        end
      end

      notes = organization_slug ? Note.joins(member: :organization).where(member: { organizations: { slug: organization_slug } }) : Note.all
      notes = notes.where("description_html LIKE ?", '%data-type="mention"%')
      notes.in_batches do |notes|
        notes.each do |note|
          new_description = update_mentions(Nokogiri::HTML.fragment(note.description_html))
          if new_description != note.description_html
            note.update_columns(description_html: new_description, description_state: nil) unless dry_run
            updated_notes_count += 1
          end
        end
      end

      updates = [
        "#{updated_posts_count} Post #{"record".pluralize(updated_posts_count)}",
        "#{updated_comments_count} Comment #{"record".pluralize(updated_comments_count)}",
        "#{updated_notes_count} Note #{"record".pluralize(updated_notes_count)}",
      ]

      "#{dry_run ? "Would have updated" : "updated"} #{updates.join(", ")}"
    end

    def self.update_mentions(doc)
      nodes = doc.css("span[data-type=\"mention\"]")

      member_ids = nodes.pluck("data-id")
      members = OrganizationMembership.eager_load(:user).where(public_id: member_ids).index_by(&:public_id)

      nodes.each do |node|
        member = members[node["data-id"]]
        next unless member && member.user # rubocop:disable Style/SafeNavigation

        node["data-label"] = member.user.display_name
        node["data-username"] = member.user.username
        node.content = "@#{member.user.display_name}"
      end

      doc.to_s
    end
  end
end
