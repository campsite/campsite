# frozen_string_literal: true

class FigmaClient
  class Oauth
    BASE_64_CREDENTIALS = Base64.strict_encode64("#{Rails.application.credentials.dig(:figma, :client_id)}:#{Rails.application.credentials.dig(:figma, :client_secret)}")

    def token(redirect_uri:, code:)
      response = connection.post("v1/oauth/token", { redirect_uri: redirect_uri, code: code, grant_type: "authorization_code" })
      raise FigmaClientError, response.body["message"] unless response.success?

      response.body
    end

    def refresh_token(refresh_token)
      response = connection.post("v1/oauth/refresh", { refresh_token: refresh_token })
      raise FigmaClientError, response.body["message"] unless response.success?

      response.body
    end

    private

    def connection
      @connection ||= Faraday.new(
        url: "https://api.figma.com/",
        headers: {
          "Authorization": "Basic #{BASE_64_CREDENTIALS}",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      ) do |f|
        f.request(:url_encoded)
        f.response(:json)
      end
    end
  end
end
