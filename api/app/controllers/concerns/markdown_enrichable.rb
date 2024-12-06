# frozen_string_literal: true

module MarkdownEnrichable
  extend ActiveSupport::Concern

  def markdown_to_html(text)
    text.strip! if text.present?

    return "" if text.blank?

    enriched = MentionsFormatter.new(text).replace
    enriched = ReactionsFormatter.new(enriched, organization: current_organization).replace

    client = StyledText.new(Rails.application.credentials&.dig(:styled_text_api, :authtoken))
    html = client.markdown_to_html(markdown: enriched, editor: "markdown")

    html
  rescue StyledText::StyledTextError => e
    Sentry.capture_exception(e)
    fallback_html(text)
  end

  private

  def fallback_html(text)
    "<p>#{text}</p>"
  end
end
