# frozen_string_literal: true

module ZapierTestHelper
  def zapier_app_request_headers(token)
    {
      "x-campsite-zapier-token" => token,
    }
  end

  def zapier_oauth_request_headers(token)
    {
      "Authorization" => "Bearer #{token}",
    }
  end
end
