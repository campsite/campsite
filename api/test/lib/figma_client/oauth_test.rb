# frozen_string_literal: true

require "test_helper"

class FigmaClient
  class OauthTest < ActiveSupport::TestCase
    describe "#refresh_token" do
      test "refreshes an expired token" do
        VCR.use_cassette("figma/refresh_token") do
          response = FigmaClient::Oauth.new.refresh_token(Rails.application.credentials.dig(:figma, :test_oauth_refresh_token))

          assert_predicate response["access_token"], :present?
          assert_equal 7_776_000, response["expires_in"]
        end
      end

      test "raises an exception when refresh token is invalid" do
        VCR.use_cassette("figma/invalid_refresh_token") do
          assert_raises FigmaClient::FigmaClientError do
            FigmaClient::Oauth.new.refresh_token("foobar")
          end
        end
      end
    end
  end
end
