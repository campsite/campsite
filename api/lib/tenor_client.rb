# frozen_string_literal: true

class TenorClient
  class TenorClientError < StandardError; end
  class ConnectionFailedError < TenorClientError; end
  class ServerError < TenorClientError; end

  def initialize(api_key:)
    @api_key = api_key
  end

  def search(query:, limit: 10, after: nil)
    params = { key: @api_key, q: query, limit: limit }
    params[:pos] = after if after
    path = "/search?#{params.to_query}"

    Tenor::GifNodes.new(get(path))
  end

  def featured(limit: 10, after: nil)
    params = { key: @api_key, limit: limit }
    params[:pos] = after if after
    path = "/featured?#{params.to_query}"

    Tenor::GifNodes.new(get(path))
  end

  private

  def get(path)
    handle_response(connection.get("/v2#{path}"))
  rescue Faraday::ConnectionFailed => e
    raise ConnectionFailedError, e.message
  end

  def handle_response(response)
    case response.status
    when 200
      response.body
    else
      raise ServerError
    end
  end

  def connection
    @connection ||= Faraday.new(
      url: "https://tenor.googleapis.com/v2",
    ) do |f|
      f.response(:raise_error)
      f.response(:json)
      f.options.timeout = 10
      f.options.open_timeout = 10
    end
  end
end
