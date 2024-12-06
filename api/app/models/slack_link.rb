# frozen_string_literal: true

class SlackLink
  attr_reader :url

  def initialize(payload)
    @url = payload["url"]
  end

  def unfurl
    @unfurl ||= if resource
      {
        blocks: resource.build_slack_blocks,
        color: Campsite::BRAND_ORANGE_HEX_CODE,
      }
    end
  end

  def resource
    return unless parsed_uri

    @resource ||= if (match = parsed_uri.path.match(%r(^\/.+\/posts\/(?<public_id>\w+)$)))
      if (comment_match = parsed_uri.fragment&.match(/^comment-(?<public_id>\w+)$/))
        Comment.kept.not_private.find_by(public_id: comment_match[:public_id])
      else
        Post.kept.not_private.find_by(public_id: match[:public_id])
      end
    elsif (match = parsed_uri.path.match(%r(^\/.+\/digests\/(?<public_id>\w+)$)))
      digest = PostDigest.find_by(public_id: match[:public_id])
      digest if digest&.published? && !digest&.discarded?
    elsif (match = parsed_uri.path.match(%r(^/.+\/projects\/(?<public_id>\w+)$)))
      Project.not_private.find_by(public_id: match[:public_id])
    end
  end

  private

  def parsed_uri
    @parsed_uri ||= URI.parse(url)
  rescue URI::InvalidURIError
    Rails.logger.info("[SlackLink] rescued exception URI::InvalidURIError for #{url}")
    nil
  end
end
