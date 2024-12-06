# frozen_string_literal: true

require "uri"

class LinearOauth2Client
  def initialize(client_id:, client_secret:)
    @client_id = client_id
    @client_secret = client_secret
  end

  def retrieve_access_token!(code:, callback_url:)
    body = URI.encode_www_form({
      code: code,
      client_id: @client_id,
      client_secret: @client_secret,
      redirect_uri: callback_url,
      grant_type: "authorization_code",
    })

    connection.post("/oauth/token", body).body
  end

  def revoke!(access_token:)
    connection.post("/oauth/revoke") do |request|
      request.headers["Authorization"] = "Bearer #{access_token}"
    end
  end

  private

  def connection
    @connection ||= Faraday.new(
      url: "https://api.linear.app/",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    ) do |f|
      f.response(:json)
    end
  end
end
