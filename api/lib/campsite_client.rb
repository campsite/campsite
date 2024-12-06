# frozen_string_literal: true

require "faraday"
require "json"

class CampsiteClient
  class CampsiteClientError < StandardError; end
  class ConnectionFailedError < CampsiteClientError; end
  class UnauthorizedError < CampsiteClientError; end
  class ServerError < CampsiteClientError; end

  def create_post(title: nil, content_markdown: nil, project_id: nil)
    body = {
      title: title,
      content_markdown: content_markdown,
      channel_id: project_id,
    }.compact

    response = connection.post("/posts") do |req|
      req.body = body.to_json
    end

    handle_response(response)
  end

  def create_comment(post_id:, content_markdown:, parent_id: nil)
    body = {
      content_markdown: content_markdown,
      parent_id: parent_id,
    }.compact

    response = connection.post("/v2/posts/#{post_id}/comments") do |req|
      req.body = body.to_json
    end

    handle_response(response)
  end

  def create_message(thread_id:, content:)
    body = {
      content_markdown: content,
    }

    response = connection.post("/v2/threads/#{thread_id}/messages") do |req|
      req.body = body.to_json
    end

    handle_response(response)
  end

  private

  def connection
    @connection ||= Faraday.new(
      url: Rails.application.credentials.dig(:campsite, :api_url),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer #{Rails.application.credentials.dig(:campsite, :api_token)}",
      },
    ) do |f|
      f.response(:json)
    end
  end

  def handle_response(response)
    case response.status
    when 200..299
      response.body
    when 401
      raise UnauthorizedError, "Authentication failed"
    when 403
      raise CampsiteClientError, "Access denied"
    when 404
      raise CampsiteClientError, "Resource not found"
    when 422
      raise CampsiteClientError, response.body["error"] || "Validation failed"
    when 400..499
      raise CampsiteClientError, response.body["error"] || "Client error"
    else
      raise ServerError, response.body["error"] || "Unknown server error"
    end
  rescue Faraday::ConnectionFailed
    raise ConnectionFailedError, "Failed to connect to Campsite API"
  end
end
