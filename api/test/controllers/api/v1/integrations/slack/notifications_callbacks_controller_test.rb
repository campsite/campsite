# frozen_string_literal: true

require "test_helper"
require "test_helpers/slack_test_helper"

module Api
  module V1
    module Integrations
      module Slack
        class NotificationsCallbacksControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers
          include SlackTestHelper

          setup do
            @member = create(:organization_membership)
            @user = @member.user
            @organization = @member.organization
            @integration = create(:integration, provider: :slack, owner: @organization)
            @slack_team_id = create(:slack_team_id, integration: @integration).value
            @state = SecureRandom.uuid
            get new_integrations_auth_url, params: { auth_url: "https://example.com?state=#{@state}", host: "auth.campsite.com" }
          end

          describe "#show" do
            context "with a valid code and Slack team" do
              before(:each) do
                ::Slack::Web::Client.any_instance.stubs(:oauth_v2_access).returns({
                  "ok" => true,
                  "access_token" => "xoxb-17653672481-19874698323-pdFZKVeTuE8sk7oOcBrzbqgy",
                  "token_type" => "bot",
                  "scope" => "commands,incoming-webhook",
                  "bot_user_id" => "U0KRQLJ9H",
                  "app_id" => "A0KRD7HC3",
                  "team" => { "name" => "Slack Softball Team", "id" => @slack_team_id },
                  "enterprise" => { "name" => "slack-sports", "id" => "E12345678" },
                  "authed_user" => {
                    "id" => "U1234",
                    "scope" => "chat:write",
                    "access_token" => "xoxp-1234",
                    "token_type" => "user",
                  },
                })
              end

              test "persists Slack user ID and enables Slack notifications for org admin" do
                sign_in @user
                get organization_integrations_slack_notifications_callback_path(@organization.slug), params: { code: "valid", state: @state }

                assert_response :redirect
                assert_equal response.redirect_url, "#{Campsite.base_app_url}/me/settings"
                integration_organization_membership = IntegrationOrganizationMembership.find_by!(integration: @integration, organization_membership: @member)
                user_id_data = integration_organization_membership.data.find_by!(name: IntegrationOrganizationMembershipData::INTEGRATION_USER_ID)
                assert_equal "U1234", user_id_data.value
                assert_enqueued_sidekiq_job(SlackConnectedConfirmationJob, args: [integration_organization_membership.id])
                assert_predicate @member.reload, :slack_notifications_enabled?
              end

              test "persists Slack user ID and enables Slack notifications for org member" do
                member = create(:organization_membership, :member, organization: @organization)
                user = member.user

                sign_in user
                get organization_integrations_slack_notifications_callback_path(@organization.slug), params: { code: "valid", state: @state }

                assert_response :redirect
                assert_equal response.redirect_url, "#{Campsite.base_app_url}/me/settings"
                integration_organization_membership = IntegrationOrganizationMembership.find_by!(integration: @integration, organization_membership: member)
                user_id_data = integration_organization_membership.data.find_by!(name: IntegrationOrganizationMembershipData::INTEGRATION_USER_ID)
                assert_equal "U1234", user_id_data.value
                assert_predicate member.reload, :slack_notifications_enabled?
              end

              test "404s if organization is missing Slack integration" do
                organization = create(:organization)

                sign_in @user
                assert_raises ActiveRecord::RecordNotFound do
                  get organization_integrations_slack_notifications_callback_path(organization.slug), params: { code: "valid", state: @state }
                end
              end

              test "404s if state does not match session" do
                sign_in @user
                get organization_integrations_slack_notifications_callback_path(@organization.slug), params: { code: "valid", state: "invalid-state" }

                assert_response :forbidden
                assert_includes response.body, "Invalid state"
              end

              test "redirects an unauthenticated user to sign in" do
                get organization_integrations_slack_notifications_callback_path(@organization.slug), params: { code: "valid", state: @state }

                assert_response :redirect
                assert_includes response.redirect_url, "/sign-in"
              end
            end

            context "with a Slack team that doesn't match organization Slack team" do
              before(:each) do
                ::Slack::Web::Client.any_instance.stubs(:oauth_v2_access).returns({
                  "ok" => true,
                  "access_token" => "xoxb-17653672481-19874698323-pdFZKVeTuE8sk7oOcBrzbqgy",
                  "token_type" => "bot",
                  "scope" => "commands,incoming-webhook",
                  "bot_user_id" => "U0KRQLJ9H",
                  "app_id" => "A0KRD7HC3",
                  "team" => { "name" => "Slack Softball Team", "id" => "OTHER_TEAM_ID" },
                  "enterprise" => { "name" => "slack-sports", "id" => "E12345678" },
                  "authed_user" => {
                    "id" => "U1234",
                    "scope" => "chat:write",
                    "access_token" => "xoxp-1234",
                    "token_type" => "user",
                  },
                })
              end

              test "returns an error" do
                sign_in @user
                get organization_integrations_slack_notifications_callback_path(@organization.slug), params: { code: "valid", state: @state }

                assert_response :forbidden
                assert_includes response.body, "This Slack workspace did not match your organization&#39;s Slack workspace. Please try again."
                assert_not IntegrationOrganizationMembership.find_by(integration: @integration, organization_membership: @member)
              end
            end

            context "with an invalid code" do
              before(:each) do
                ::Slack::Web::Client.any_instance.stubs(:oauth_v2_access).raises(::Slack::Web::Api::Errors::InvalidCode.new("invalid_code", "invalid_code"))
              end

              test "returns an error" do
                sign_in @user
                get organization_integrations_slack_notifications_callback_path(@organization.slug), params: { code: "invalid", state: @state }

                assert_response :forbidden
                assert_includes response.body, "invalid_code"
              end
            end
          end
        end
      end
    end
  end
end
