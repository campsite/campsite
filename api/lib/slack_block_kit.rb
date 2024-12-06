# frozen_string_literal: true

class SlackBlockKit
  class << self
    def mrkdwn_section_block(text:)
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: text,
        },
      }
    end

    def mrkdwn_context_block(text:)
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: text,
          },
        ],
      }
    end

    def actions_block(elements:)
      {
        type: "actions",
        elements: elements,
      }
    end

    def mrkdwn_link(text:, url:)
      "<#{escape_url(url)}|#{escape_text(text) || escape_url(url)}>"
    end

    def button(text:, action_id:, url:, type: "plain_text")
      {
        type: "button",
        text: { type: type, text: text },
        action_id: action_id,
        url: url,
      }
    end

    def header(text:, type: "plain_text")
      {
        type: "header",
        text: { type: type, text: text },
      }
    end

    private

    def escape_text(text)
      return unless text

      text.gsub("&", "&amp;").gsub("<", "&lt;").gsub(">", "&gt;")
    end

    def escape_url(url)
      return unless url

      escape_text(url).gsub("|", "%7C")
    end
  end
end
