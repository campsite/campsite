# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Integrations
      module Linear
        class CallbacksControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @member = create(:organization_membership)
            @user = @member.user
            @organization = @user.organizations.first
          end

          describe "#show" do
            test "creates a Linear integration for an org admin" do
              LinearOauth2Client.any_instance.expects(:retrieve_access_token!).with(code: "valid-code", callback_url: linear_integration_callback_url(subdomain: Campsite.api_subdomain)).returns(
                {
                  "access_token": "lin_access_token",
                  "scope": ["issues_create", "read"],
                }.with_indifferent_access,
              )

              assert_difference -> { @organization.integrations.count } do
                sign_in @user
                get linear_integration_callback_url(subdomain: Campsite.api_subdomain), params: { code: "valid-code", state: @organization.public_id }

                assert_response :redirect
                integration = @organization.integrations.first!
                assert_equal "linear", integration.provider
                assert_equal "scopes", integration.data.first.name
                assert_equal "[\"issues_create\", \"read\"]", integration.data.first.value

                assert_enqueued_sidekiq_job(::Integrations::Linear::SetOrganizationIdJob, args: [@organization.id])
              end
            end

            test "updates the existing Linear integration for the org" do
              scopes = "[\"issues_create\", \"read\"]"
              integration = create(:integration, :linear, owner: @organization)
              integration.data.create!(name: IntegrationData::SCOPES, value: scopes)

              LinearOauth2Client.any_instance.expects(:retrieve_access_token!).with(code: "valid-code", callback_url: linear_integration_callback_url(subdomain: Campsite.api_subdomain)).returns({
                "access_token": "lin_access_token",
                "scope": ["issues_create", "read"],
              }.with_indifferent_access)

              assert_no_difference -> { @organization.integrations.count } do
                sign_in @user
                get linear_integration_callback_url(subdomain: Campsite.api_subdomain), params: { code: "valid-code", state: @organization.public_id }

                assert_response :redirect
                integration = @organization.integrations.first!
                assert_equal "linear", integration.provider
                assert integration.data.find_by!(name: IntegrationData::SCOPES, value: scopes)
              end
            end

            test "return 403 for an invalid code" do
              LinearOauth2Client.any_instance.stubs(:retrieve_access_token!).returns({ "error": "invalid_code", "error_description": "Invalid code: code is invalid" })

              sign_in @user
              get linear_integration_callback_path(@organization.slug), params: { code: "invalid-code", state: @organization.public_id }
              assert_response :forbidden
            end

            test "return 403 for a non-admin" do
              org_member = create(:organization_membership, :member, organization: @organization).user

              sign_in org_member
              get linear_integration_callback_path(@organization.slug), params: { code: "valid", state: @organization.public_id }
              assert_response :forbidden
            end

            test "redirects an unauthenticated user to log in" do
              get linear_integration_callback_path
              assert_response :redirect
              assert_includes response.redirect_url, new_user_session_path
            end
          end
        end
      end
    end
  end
end
