# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Integrations
      module Figma
        class CallbacksControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @member = create(:organization_membership)
            @user = @member.user
            @organization = @user.organizations.first
            @code = "valid-code"
            @access_token = "valid-access-token"
            @refresh_token = "valid-refresh-token"
            @expires_in = 7_776_000
          end

          describe "#show" do
            test "creates a Figma integration for a user" do
              FigmaClient::Oauth.any_instance.expects(:token).with(code: @code, redirect_uri: figma_integration_callback_url(subdomain: Campsite.api_subdomain)).returns(
                { "access_token" => @access_token, "refresh_token" => @refresh_token, "expires_in" => @expires_in },
              )

              Timecop.freeze do
                assert_difference -> { @user.integrations.count } do
                  sign_in @user
                  get figma_integration_callback_path, params: { code: @code, state: @organization.public_id }
                end

                assert_response :redirect
                integration = @user.integrations.first!
                assert_equal "figma", integration.provider
                assert_equal @access_token, integration.token
                assert_equal @refresh_token, integration.refresh_token
                assert_in_delta @expires_in.seconds.from_now, integration.token_expires_at, 2.seconds
                assert_enqueued_sidekiq_job(UpdateFigmaUserJob, args: [integration.id])
              end
            end

            test "updates existing Figma integration" do
              FigmaClient::Oauth.any_instance.expects(:token).with(code: @code, redirect_uri: figma_integration_callback_url(subdomain: Campsite.api_subdomain)).returns(
                { "access_token" => @access_token, "refresh_token" => @refresh_token, "expires_in" => @expires_in },
              )

              Timecop.freeze do
                integration = create(:integration, owner: @user, provider: :figma)

                sign_in @user
                get figma_integration_callback_path, params: { code: @code, state: @organization.public_id }

                assert_response :redirect
                integration.reload
                assert_equal @access_token, integration.token
                assert_equal @refresh_token, integration.refresh_token
                assert_in_delta @expires_in.seconds.from_now, integration.token_expires_at, 2.seconds
                assert_enqueued_sidekiq_job(UpdateFigmaUserJob, args: [integration.id])
              end
            end

            test "return 403 for an invalid code" do
              invalid_code = "invalid-code"

              FigmaClient::Oauth.any_instance.expects(:token).with(code: invalid_code, redirect_uri: figma_integration_callback_url(subdomain: Campsite.api_subdomain)).raises(
                FigmaClient::FigmaClientError.new("Invalid code"),
              )

              sign_in @user
              get figma_integration_callback_path, params: { code: invalid_code, state: @organization.public_id }

              assert_response :forbidden
              assert_includes response.body, "Invalid code"
            end

            test "redirects an unauthenticated user to log in" do
              get figma_integration_callback_path, params: { code: @code, state: @organization.public_id }

              assert_response :redirect
              assert_includes response.redirect_url, new_user_session_path
            end
          end
        end
      end
    end
  end
end
