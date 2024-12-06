# frozen_string_literal: true

module Backfills
  class MissingProseLinkBackfill
    require "nokogiri"

    def self.run(dry_run: true)
      posts = Post.where("description_html LIKE '%<a %'")

      posts.each do |post|
        doc = Nokogiri::HTML.fragment(post.description_html)

        links = doc.css("a:not(.prose-link)")
        links.each do |link|
          existing_classes = link["class"]
          link["class"] = if existing_classes.nil?
            "prose-link"
          else
            "#{existing_classes} prose-link"
          end
        end

        post.update_columns(description_html: doc.to_s) unless dry_run
      end

      "#{dry_run ? "Would have updated" : "Updated"} #{posts.size} posts with missing prose links"
    end
  end
end
