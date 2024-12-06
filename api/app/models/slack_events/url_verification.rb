# frozen_string_literal: true

module SlackEvents
  class UrlVerification
    TYPE = "url_verification"

    def initialize(params)
      @params = params
    end

    def handle
      { challenge: challenge }
    end

    private

    def challenge
      @params["challenge"]
    end
  end
end
