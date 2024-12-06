# frozen_string_literal: true

class PostDigest
  class BuildSlackBlocks
    include ActionView::Helpers::SanitizeHelper

    def initialize(digest:)
      @digest = digest
    end

    attr_reader :digest

    delegate :mrkdwn_section_block, :mrkdwn_context_block, :header, :button, to: SlackBlockKit

    def run
      return [] unless @digest.published?

      [
        header(text: @digest.title),
        *description_blocks,
        mrkdwn_context_block(text: @digest.mailer_byline),
        mrkdwn_context_block(text: @digest.mailer_posts_line),
        {
          type: "actions",
          elements: [slack_primary_action],
        },
      ].compact
    end

    private

    def description_blocks
      return [] if @digest.description.blank?

      [mrkdwn_section_block(text: @digest.description)]
    end

    def slack_primary_action
      text = "View #{@digest.posts_count} #{"post".pluralize(@digest.posts_count)}"

      button(text: text, action_id: @digest.public_id, url: @digest.share_url)
    end
  end
end
