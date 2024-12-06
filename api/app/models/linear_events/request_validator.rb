# frozen_string_literal: true

module LinearEvents
  class RequestValidator
    attr_reader :http_request, :params

    def initialize(http_request, params)
      @http_request = http_request
      @params = params
    end

    def valid?
      valid_signature? && valid_timestamp?
    end

    private

    def timestamp
      params["webhookTimestamp"]
    end

    def signature
      @signature ||= http_request.headers["Linear-Signature"]
    end

    def valid_timestamp?
      timestamp > 1.minute.ago.to_i
    end

    # https://developers.linear.app/docs/graphql/webhooks#securing-webhooks
    def valid_signature?
      digest = OpenSSL::Digest.new("sha256")
      signing_secret = Rails.application.credentials.linear.webhook_signing_secret
      body = http_request.body.read
      computed_signature = OpenSSL::HMAC.hexdigest(digest, signing_secret, body)

      ActiveSupport::SecurityUtils.secure_compare(signature, computed_signature)
    end
  end
end
