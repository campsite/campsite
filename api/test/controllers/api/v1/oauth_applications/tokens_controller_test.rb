# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module OauthApplications
      class TokensControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @admin = create(:organization_membership, :admin)
          @org = @admin.organization
          @oauth_application = create(:oauth_application, owner: @org)
        end

        context "#create" do
          test "creates an access token" do
            sign_in @admin.user

            create_access_token

            assert_response :created
            assert_response_gen_schema
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            create_access_token
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            create_access_token
            assert_response :unauthorized
          end

          def create_access_token
            post(organization_oauth_application_tokens_path(@org.slug, @oauth_application.public_id), as: :json)
          end
        end
      end
    end
  end
end
