# frozen_string_literal: true

require "test_helper"

module Doorkeeper
  class TokensControllerTest < ActionDispatch::IntegrationTest
    test "returns the organization name" do
      token = create(:access_token, :zapier)

      get oauth_token_info_url(subdomain: "auth"),
        headers: {
          "Authorization" => "Bearer #{token.plaintext_token}",
        }

      assert_response :success
      assert json_response["resource_name"], token.resource_owner.name
    end

    test "does not return the organization name with an invalid token" do
      get oauth_token_info_url(subdomain: "auth"),
        headers: {
          "Authorization" => "Bearer invalid_token",
        }

      assert_response :unauthorized
    end

    test "does not return the organization name with an expired token" do
      token = create(:access_token, :zapier, expires_in: 0)

      get oauth_token_info_url(subdomain: "auth"),
        headers: {
          "Authorization" => "Bearer #{token.plaintext_token}",
        }

      assert_response :unauthorized
    end
  end
end
