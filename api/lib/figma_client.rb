# frozen_string_literal: true

class FigmaClient
  class FigmaClientError < StandardError; end
  class ConnectionFailedError < FigmaClientError; end
  class UnauthorizedError < FigmaClientError; end
  class BadRequestError < FigmaClientError; end
  class NotFoundError < FigmaClientError; end
  class ForbiddenError < FigmaClientError; end
  class RateLimitError < FigmaClientError; end

  include Rails.application.routes.url_helpers

  def initialize(token)
    @token = token
  end

  def me
    Figma::User.new(get("v1/me").body)
  end

  def file(file_key)
    Figma::File.new(get("v1/files/#{CGI.escape(file_key)}").body)
  end

  def file_nodes(file_key:, node_ids:)
    params = {
      ids: node_ids.join(","),
    }

    Figma::FileNodes.new(get("v1/files/#{CGI.escape(file_key)}/nodes?#{params.to_query}").body)
  end

  def image(file_key:, node_id:, scale:, format:)
    params = { ids: node_id, scale: scale, format: format }

    get("v1/images/#{CGI.escape(file_key)}?#{params.to_query}").body["images"].values.first
  end

  private

  def get(path, params = {})
    handle_response(connection.get(path, params))
  rescue Faraday::ConnectionFailed => e
    raise ConnectionFailedError, e.message
  end

  def post(path, body = {})
    handle_response(connection.post(path, body))
  rescue Faraday::ConnectionFailed => e
    raise ConnectionFailedError, e.message
  end

  def delete(path)
    handle_response(connection.delete(path))
  rescue Faraday::ConnectionFailed => e
    raise ConnectionFailedError, e.message
  end

  def handle_response(response)
    case response.status
    when 400
      raise BadRequestError, response.body["err"]
    when 401
      raise UnauthorizedError, response.body["err"]
    when 403
      raise ForbiddenError, response.body["err"]
    when 404
      raise NotFoundError, response.body["err"]
    when 500
      raise ServerError, response.body["err"]
    when 503
      raise RateLimitError, response.body["err"]
    end

    response
  end

  def connection
    @connection ||= Faraday.new(
      url: "https://api.figma.com/",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer #{@token}",
      },
    ) do |f|
      f.response(:json)
      f.options.timeout = 10
      f.options.open_timeout = 10
    end
  end
end
