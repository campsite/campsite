# frozen_string_literal: true

class ImgixClient
  def initialize(api_key:)
    @api_key = api_key
  end

  attr_reader :api_key

  def add_asset(source_id:, origin_path:)
    post("/api/v1/sources/#{source_id}/assets/add/#{origin_path}").body
  rescue Faraday::ConflictError
    Rails.logger.info("[ImgixClient] Asset already added: #{origin_path}")
    ""
  end

  private

  def post(path, body = {})
    connection.post(path, body.to_json)
  end

  def connection
    @connection ||= Faraday.new(
      url: "https://api.imgix.com/",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer #{api_key}",
      },
    ) do |f|
      f.response(:raise_error)
      f.response(:json)
    end
  end
end
