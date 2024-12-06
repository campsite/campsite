# frozen_string_literal: true

module Referenceable
  POST_URL_REGEX = %r{#{Campsite.base_app_url}/(?<org_slug>[a-zA-Z0-9_-]+)/posts/(?<post_id>[a-zA-Z0-9]+)(?:#comment-(?<comment_id>[a-zA-Z0-9]+))?}i
  NOTE_URL_REGEX = %r{#{Campsite.base_app_url}/(?<org_slug>[a-zA-Z0-9_-]+)/notes/(?<note_id>[a-zA-Z0-9]+)(?:#comment-(?<comment_id>[a-zA-Z0-9]+))?}i

  def extract_post_ids(text)
    matches(text).filter { |match| match[:comment_id].blank? }.pluck(:post_id).uniq
  end

  def extract_comment_ids(text)
    matches(text).pluck(:comment_id).compact.uniq
  end

  def extract_note_ids(text)
    matches(text).filter { |match| match[:note_id].present? }.pluck(:note_id).uniq
  end

  def contains_campsite_urls?(text)
    matches(text).any?
  end

  private

  def matches(text)
    return [] if text.blank?

    post_matches = text.scan(POST_URL_REGEX).map do |match|
      {
        org_slug: match[0],
        post_id: match[1],
        comment_id: match[2],
        note_id: nil,
      }
    end

    note_matches = text.scan(NOTE_URL_REGEX).map do |match|
      {
        org_slug: match[0],
        note_id: match[1],
        comment_id: match[2],
        post_id: nil,
      }
    end

    post_matches + note_matches
  end
end
