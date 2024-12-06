# frozen_string_literal: true

class Comment
  class BuildSlackBlocks
    include ActionView::Helpers::SanitizeHelper

    def initialize(comment:)
      @comment = comment
    end

    attr_reader :comment

    delegate :attachments, :user, :public_id, :url, to: :comment
    delegate :mrkdwn_section_block, :mrkdwn_context_block, :mrkdwn_link, :actions_block, :button, to: SlackBlockKit

    def run
      [
        title_block,
        *body_blocks,
        *preview_blocks,
        *attachment_context_blocks,
        actions_block(elements: action_elements),
      ].compact
    end

    def body_blocks
      canvas_accessory = canvas_comment_accessory

      md = StyledText.new(Rails.application.credentials&.dig(:styled_text_api, :authtoken))
      sections = md.html_to_slack_blocks(comment.slack_body_html)

      if sections&.first
        sections[0][:accessory] = canvas_accessory if canvas_accessory
      end

      sections
    rescue StyledText::StyledTextError => e
      Sentry.capture_exception(e)

      [mrkdwn_section_block(text: strip_tags(comment.slack_body_html)).merge(accessory: canvas_accessory)]
    end

    def preview_blocks
      return if preview_attachment.blank?

      [{
        type: "image",
        image_url: if preview_attachment.previewable?
                     preview_attachment.resize_preview_url(1200)
                   else
                     preview_attachment.resizable? ? preview_attachment.image_urls.slack_url : preview_attachment.url
                   end,
        alt_text: "Uploaded preview",
      }]
    end

    def attachment_context_blocks
      return if attachments.count <= 1

      [mrkdwn_context_block(text: "+#{attachments.count - 1} more #{"attachment".pluralize(attachments.count - 1)}")]
    end

    def canvas_comment_accessory
      if (url = @comment.canvas_preview_url(160))
        {
          type: "image",
          image_url: url,
          alt_text: "Attachment comment preview",
        }
      end
    end

    private

    def title_block
      mrkdwn_section_block(text: "*#{user.display_name}* commented on #{mrkdwn_link(url: comment.subject.url, text: comment.subject.slack_link_title)}:")
    end

    def preview_attachment
      attachments.select { |attachment| attachment.image? || attachment.previewable? }.first
    end

    def action_elements
      [button(text: "View comment", action_id: public_id, url: url)]
    end
  end
end
