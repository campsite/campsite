# frozen_string_literal: true

# This is a modified version of the default controller that returns the resource owner's name, which we use to identify the Zapier connection.
# https://github.com/doorkeeper-gem/doorkeeper/blob/main/app/controllers/doorkeeper/token_info_controller.rb

module Doorkeeper
  class TokenInfoController < Doorkeeper::ApplicationMetalController
    def show
      if doorkeeper_token&.accessible?
        render(
          json: {
            resource_name: doorkeeper_token.resource_owner.name,
          },
        )
      else
        error = OAuth::InvalidTokenResponse.new
        response.headers.merge!(error.headers)
        render(json: error.body, status: error.status)
      end
    end
  end
end
