# frozen_string_literal: true

module Backfills
  class MentionClassBackfill
    require "nokogiri"

    def self.run(dry_run: true)
      updated_posts = 0
      updated_comments = 0
      updated_notes = 0

      like = "%data-type=\"mention\"%"

      Post.where("description_html LIKE ?", like).each do |post|
        fixed = update_html(post.description_html)
        next if fixed.blank?

        post.update_columns(description_html: fixed) unless dry_run
        Rails.logger.debug { "Updated post #{post.id}" }
        updated_posts += 1
      end

      Comment.where("body_html LIKE ?", like).each do |comment|
        fixed = update_html(comment.body_html)
        next if fixed.blank?

        comment.update_columns(body_html: fixed) unless dry_run
        updated_comments += 1
      end

      Note.where("description_html LIKE ?", like).each do |note|
        fixed = update_html(note.description_html)
        next if fixed.blank?

        note.update_columns(description_html: fixed, description_state: nil) unless dry_run
        updated_notes += 1
      end

      updates = [
        "#{updated_posts} posts",
        "#{updated_comments} comments",
        "#{updated_notes} notes",
      ]

      "#{dry_run ? "Would have updated" : "Updated"} #{updates.join(", ")}"
    end

    def self.update_html(html)
      return if html.blank?

      doc = Nokogiri::HTML.fragment(html)
      links = doc.css('span[data-type="mention"]:not(.mention)')

      return if links.empty?

      links.each do |link|
        existing_classes = link["class"]
        link["class"] = if existing_classes.nil?
          "mention"
        else
          "#{existing_classes} mention"
        end
      end

      doc.to_s
    end
  end
end
