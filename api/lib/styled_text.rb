# frozen_string_literal: true

class StyledText
  class StyledTextError < StandardError; end
  class ConnectionFailedError < StyledTextError; end
  class UnauthorizedError < StyledTextError; end
  class ServerError < StyledTextError; end

  EDITOR_TYPES = ["chat", "markdown", "note"].freeze

  def initialize(authtoken)
    @authtoken = authtoken
  end

  def html_to_slack_blocks(html)
    response = post(path: "/html_to_slack", body: { html: html })
    JSON.parse(response.body, { symbolize_names: true })
  end

  def markdown_to_html(markdown:, editor:)
    unless EDITOR_TYPES.include?(editor)
      raise StyledTextError, "Invalid editor type #{editor}"
    end

    response = post(path: "/markdown_to_html", body: { markdown: markdown, editor: editor })
    json = JSON.parse(response.body, { symbolize_names: true })
    json[:html]
  end

  private

  def connection
    @connection ||= Faraday.new(
      url: Campsite.base_styled_text_api_url,
    )
  end

  def post(path:, body:)
    response = connection.post(path, body.to_json, {
      "Content-Type": "application/json",
      "Authorization": "Bearer #{@authtoken}",
    })

    case response.status
    when 200
      response
    when 401
      raise UnauthorizedError
    else
      raise ServerError
    end
  rescue Faraday::ConnectionFailed
    raise ConnectionFailedError
  end
end
