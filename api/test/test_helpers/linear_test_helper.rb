# frozen_string_literal: true

module LinearTestHelper
  def linear_request_signature_headers(params:)
    signing_secret = Rails.application.credentials.linear.webhook_signing_secret
    digest = OpenSSL::Digest.new("SHA256")
    computed_signature = OpenSSL::HMAC.hexdigest(digest, signing_secret, params.to_json)

    {
      "HTTP_LINEAR_SIGNATURE" => computed_signature,
    }
  end

  def add_webhook_timestamp(params)
    params.merge!(webhookTimestamp: Time.current.to_i)
  end
end
