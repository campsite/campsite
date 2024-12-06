# frozen_string_literal: true

class Post
  class BuildSlackBlocks
    MAX_DESCRIPTION_BLOCKS = 2

    include ActionView::Helpers::SanitizeHelper

    def initialize(post:, slack_context_block: nil)
      @post = post
      @slack_context_block = slack_context_block
    end

    attr_reader :post

    delegate :title, :attachments, :sorted_attachments, :links, :project, :tags, :kept_feedback_requests, :poll, :url, :public_id, :author, to: :post
    delegate :mrkdwn_section_block, :mrkdwn_context_block, :mrkdwn_link, :actions_block, :button, to: SlackBlockKit

    def run
      [
        slack_context_block,
        title_block,
        *description_blocks,
        *preview_blocks,
        *attachment_context_blocks,
        project_block,
        tags_block,
        feedback_requests_block,
        actions_block(elements: action_elements),
      ].compact
    end

    def description_blocks
      md = StyledText.new(Rails.application.credentials&.dig(:styled_text_api, :authtoken))
      blocks = md.html_to_slack_blocks(post.slack_description_html)
      return blocks if blocks.length <= MAX_DESCRIPTION_BLOCKS

      @truncated = true
      last_block = blocks[MAX_DESCRIPTION_BLOCKS - 1]
      last_block[:text][:text] = "#{last_block[:text][:text].gsub(/\.$/, "")}…" if last_block.dig(:text, :text)
      blocks.first(MAX_DESCRIPTION_BLOCKS - 1) + [last_block]
    rescue StyledText::StyledTextError => e
      Sentry.capture_exception(e)
      text = strip_tags(post.slack_description_html)
      return if text.blank?

      [mrkdwn_section_block(text: text)]
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

    def project_block
      return unless project

      mrkdwn_context_block(text: "Posted in #{mrkdwn_link(text: project.name, url: project.url)}")
    end

    def tags_block
      return if tags.blank?

      mrkdwn_context_block(text: tags.map { |tag| mrkdwn_link(text: "##{tag.name}", url: tag.url) }.join(", "))
    end

    private

    def slack_primary_action
      text = if post.feedback_requested_status?
        if @truncated
          "View full post and add feedback"
        else
          "Add feedback"
        end
      elsif @truncated
        "View full post"
      else
        "View post"
      end

      button(text: text, action_id: public_id, url: url)
    end

    def slack_context_block
      return @slack_context_block if @slack_context_block.present?

      multiple_attachments = attachments.count > 1
      text = "*#{author.display_name}* "

      text += if poll
        "shared a poll:"
      elsif post.parent
        "shared v#{post.version} of a post:"
      elsif multiple_attachments
        "shared #{attachments.count} attachments:"
      else
        "shared:"
      end

      mrkdwn_section_block(text: text)
    end

    def preview_attachment
      @preview_attachment ||= sorted_attachments.select { |attachment| attachment.image? || attachment.previewable? }.first
    end

    def feedback_requests_block
      return if kept_feedback_requests.none?

      names = kept_feedback_requests.map { |fr| "• #{fr.user.display_name}" }.join("\n")
      mrkdwn_section_block(text: "*Feedback requests:*\n#{names}")
    end

    def action_elements
      action_elements = [slack_primary_action]

      links.select(&:figma?).each do |link|
        action_elements << button(text: "View on Figma", action_id: link.public_id, url: link.url)
      end

      if post.parent
        action_elements << button(text: "View v#{post.version - 1}", action_id: post.parent.public_id, url: post.parent.url)
      end

      action_elements
    end

    def title_block
      mrkdwn_section_block(text: mrkdwn_link(text: "*#{title}*", url: url)) if title.present?
    end
  end
end
