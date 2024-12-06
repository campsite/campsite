# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module OauthApplications
      class SecretRenewalsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        context "#create" do
          setup do
            @admin = create(:organization_membership, :admin)
            @org = @admin.organization
            @oauth_app = create(:oauth_application, owner: @org)
          end

          test "renews the secret" do
            sign_in @admin.user

            assert_nil @oauth_app.last_copied_secret_at

            renew_secret

            assert_response :ok
            assert_response_gen_schema
            assert_not_nil json_response["client_secret"]
            assert_not_equal @oauth_app.secret, @oauth_app.reload.secret
            assert_not_nil @oauth_app.last_copied_secret_at
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            renew_secret
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            renew_secret
            assert_response :unauthorized
          end

          def renew_secret
            post(organization_oauth_application_secret_renewals_path(@org.slug, @oauth_app.public_id), as: :json)
          end
        end
      end
    end
  end
end
