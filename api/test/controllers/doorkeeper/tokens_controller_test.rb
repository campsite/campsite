# frozen_string_literal: true

require "test_helper"

module Doorkeeper
  class TokensControllerTest < ActionDispatch::IntegrationTest
    include Devise::Test::IntegrationHelpers

    context "#create" do
      test "refreshes a token" do
        token = create(:access_token, :zapier, expires_in: 0)

        post oauth_token_url(subdomain: "auth"),
          params: {
            grant_type: "refresh_token",
            refresh_token: token.plaintext_refresh_token,
            client_id: token.application.uid,
            client_secret: token.application.plaintext_secret,
          }

        assert_response :success
        assert_includes response.body, "access_token"
        assert_includes response.body, "refresh_token"
      end
    end
  end
end
