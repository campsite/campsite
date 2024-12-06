# frozen_string_literal: true

class UpdateCoToComLinkJob < BaseJob
  sidekiq_options queue: "background"

  OLD_DOMAIN = "https://app.campsite.co/"
  NEW_DOMAIN = "https://app.campsite.com/"

  def perform(subject_id, subject_type)
    if subject_type == "Post"
      post = Post.find(subject_id)
      updated = update(post, :description_html)

      if updated != post.description_html
        post.update_columns(description_html: updated)
      end
    elsif subject_type == "Comment"
      comment = Comment.find(subject_id)
      updated = update(comment, :body_html)

      if updated != comment.body_html
        comment.update_columns(body_html: updated)
      end
    elsif subject_type == "Note"
      note = Note.find(subject_id)
      updated = update(note, :description_html)

      if updated != note.description_html
        note.update_columns(description_html: updated)
      end
    end
  end

  private

  def update(subject, key)
    doc = Nokogiri::HTML.fragment(subject[key])

    doc.css("a").each do |link|
      href = link["href"]
      if href&.start_with?(OLD_DOMAIN)
        link["href"] = href.gsub(OLD_DOMAIN, NEW_DOMAIN)
      end
    end

    doc.to_html
  end
end
