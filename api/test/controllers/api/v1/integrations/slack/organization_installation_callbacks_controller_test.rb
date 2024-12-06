# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Integrations
      module Slack
        class OrganizationInstallationCallbacksControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @member = create(:organization_membership)
            @user = @member.user
            @organization = @user.organizations.first
            @state = SecureRandom.uuid
            get new_integrations_auth_url, params: { auth_url: "https://example.com?state=#{@state}" }
          end

          describe "#show" do
            test "creates a slack integration for an org admin" do
              ::Slack::Web::Client.any_instance.stubs(:oauth_v2_access).returns({
                "ok" => true,
                "access_token" => "xoxb-17653672481-19874698323-pdFZKVeTuE8sk7oOcBrzbqgy",
                "token_type" => "bot",
                "scope" => "commands,incoming-webhook",
                "bot_user_id" => "U0KRQLJ9H",
                "app_id" => "A0KRD7HC3",
                "team" => { "name" => "Slack Softball Team", "id" => "T9TK3CUKW" },
                "enterprise" => { "name" => "slack-sports", "id" => "E12345678" },
                "authed_user" => {
                  "id" => "U1234",
                  "scope" => "chat:write",
                  "access_token" => "xoxp-1234",
                  "token_type" => "user",
                },
              })

              assert_difference -> { @organization.integrations.count } do
                sign_in @user
                get organization_slack_integration_callback_path(@organization.slug), params: { code: "valid", state: @state }
              end

              assert_response :redirect
              assert_equal response.redirect_url, @organization.settings_url
              integration = @organization.integrations.first!
              assert_equal "slack", integration.provider
              assert_equal "team_id", integration.data.first.name
              integration_organization_membership = integration.integration_organization_memberships.first!
              assert_equal IntegrationOrganizationMembershipData::INTEGRATION_USER_ID, integration_organization_membership.data.first.name
              assert_equal "U1234", integration_organization_membership.data.first.value
              assert_enqueued_sidekiq_job(SyncSlackChannelsV2Job, args: [integration.id])
              refute_enqueued_sidekiq_job(SlackConnectedConfirmationJob, args: [integration_organization_membership.id])
              assert_not_predicate @member.reload, :slack_notifications_enabled?
            end

            test "redirects to success_path when provided" do
              ::Slack::Web::Client.any_instance.stubs(:oauth_v2_access).returns({
                "ok" => true,
                "access_token" => "xoxb-17653672481-19874698323-pdFZKVeTuE8sk7oOcBrzbqgy",
                "token_type" => "bot",
                "scope" => "commands,incoming-webhook",
                "bot_user_id" => "U0KRQLJ9H",
                "app_id" => "A0KRD7HC3",
                "team" => { "name" => "Slack Softball Team", "id" => "T9TK3CUKW" },
                "enterprise" => { "name" => "slack-sports", "id" => "E12345678" },
                "authed_user" => {
                  "id" => "U1234",
                  "scope" => "chat:write",
                  "access_token" => "xoxp-1234",
                  "token_type" => "user",
                },
              })
              success_path = "/success"

              sign_in @user
              get new_integrations_auth_url(params: { auth_url: "https://slack.com/oauth/authorize?state=#{@state}", success_path: success_path })
              get organization_slack_integration_callback_path(@organization.slug),
                params: {
                  code: "valid",
                  state: @state,
                }

              assert_response :redirect
              assert_equal response.redirect_url, Campsite.app_url(path: success_path)
            end

            test "renders page to open Desktop app when coming from Desktop app" do
              ::Slack::Web::Client.any_instance.stubs(:oauth_v2_access).returns({
                "ok" => true,
                "access_token" => "xoxb-17653672481-19874698323-pdFZKVeTuE8sk7oOcBrzbqgy",
                "token_type" => "bot",
                "scope" => "commands,incoming-webhook",
                "bot_user_id" => "U0KRQLJ9H",
                "app_id" => "A0KRD7HC3",
                "team" => { "name" => "Slack Softball Team", "id" => "T9TK3CUKW" },
                "enterprise" => { "name" => "slack-sports", "id" => "E12345678" },
                "authed_user" => {
                  "id" => "U1234",
                  "scope" => "chat:write",
                  "access_token" => "xoxp-1234",
                  "token_type" => "user",
                },
              })
              success_path = "/success"

              sign_in @user
              get new_integrations_auth_url(params: { auth_url: "https://slack.com/oauth/authorize?state=#{@state}", success_path: success_path, desktop_app: "true" })
              get organization_slack_integration_callback_path(@organization.slug),
                params: {
                  code: "valid",
                  state: @state,
                }

              assert_response :ok
              assert_includes response.body, Campsite.desktop_app_url(path: success_path)
            end

            test "enabled Slack notifications when stored in integration auth params" do
              ::Slack::Web::Client.any_instance.stubs(:oauth_v2_access).returns({
                "ok" => true,
                "access_token" => "xoxb-17653672481-19874698323-pdFZKVeTuE8sk7oOcBrzbqgy",
                "token_type" => "bot",
                "scope" => "commands,incoming-webhook",
                "bot_user_id" => "U0KRQLJ9H",
                "app_id" => "A0KRD7HC3",
                "team" => { "name" => "Slack Softball Team", "id" => "T9TK3CUKW" },
                "enterprise" => { "name" => "slack-sports", "id" => "E12345678" },
                "authed_user" => {
                  "id" => "U1234",
                  "scope" => "chat:write",
                  "access_token" => "xoxp-1234",
                  "token_type" => "user",
                },
              })

              sign_in @user
              get new_integrations_auth_url(params: { auth_url: "https://slack.com/oauth/authorize?state=#{@state}", enable_notifications: "true" })
              get organization_slack_integration_callback_path(@organization.slug),
                params: {
                  code: "valid",
                  state: @state,
                }

              assert_response :redirect
              integration = @organization.integrations.first!
              integration_organization_membership = integration.integration_organization_memberships.first!
              assert_enqueued_sidekiq_job(SlackConnectedConfirmationJob, args: [integration_organization_membership.id])
              assert_predicate @member.reload, :slack_notifications_enabled?
            end

            test "updates the existing slack integration for the org" do
              team_id = "T9TK3CUKW"
              scope = "commands,incoming-webhook"
              integration_user_id = "U1234"
              integration = create(:integration, owner: @organization, provider: :slack)
              integration.data.create!(name: "team_id", value: team_id)
              integration_organization_membership = integration.integration_organization_memberships.create!(organization_membership: @member)
              integration_organization_membership.data.create!(name: IntegrationOrganizationMembershipData::INTEGRATION_USER_ID, value: integration_user_id)

              ::Slack::Web::Client.any_instance.stubs(:oauth_v2_access).returns({
                "ok" => true,
                "access_token" => "xoxb-17653672481-19874698323-pdFZKVeTuE8sk7oOcBrzbqgy",
                "token_type" => "bot",
                "scope" => scope,
                "bot_user_id" => "U0KRQLJ9H",
                "app_id" => "A0KRD7HC3",
                "team" => { "name" => "Slack Softball Team", "id" => team_id },
                "enterprise" => { "name" => "slack-sports", "id" => "E12345678" },
                "authed_user" => {
                  "id" => integration_user_id,
                  "scope" => "chat:write",
                  "access_token" => "xoxp-1234",
                  "token_type" => "user",
                },
              })

              assert_no_difference -> { @organization.integrations.count } do
                sign_in @user
                get organization_slack_integration_callback_path(@organization.slug), params: { code: "valid", state: @state }
              end

              assert_response :redirect
              assert_equal response.redirect_url, @organization.settings_url
              integration = @organization.integrations.first!
              assert_equal "slack", integration.provider
              assert_equal 2, integration.data.count
              assert integration.data.find_by!(name: IntegrationData::TEAM_ID, value: team_id)
              assert integration.data.find_by!(name: IntegrationData::SCOPES, value: scope)
              integration_organization_membership = integration.integration_organization_memberships.first!
              assert integration_organization_membership.data.find_by!(name: IntegrationOrganizationMembershipData::INTEGRATION_USER_ID, value: integration_user_id)
            end

            test "404s if the member leaves the org" do
              ::Slack::Web::Client.any_instance.stubs(:oauth_v2_access).returns({
                "ok" => true,
                "access_token" => "xoxb-17653672481-19874698323-pdFZKVeTuE8sk7oOcBrzbqgy",
                "token_type" => "bot",
                "scope" => "commands,incoming-webhook",
                "bot_user_id" => "U0KRQLJ9H",
                "app_id" => "A0KRD7HC3",
                "team" => { "name" => "Slack Softball Team", "id" => "T9TK3CUKW" },
                "enterprise" => { "name" => "slack-sports", "id" => "E12345678" },
                "authed_user" => {
                  "id" => "U1234",
                  "scope" => "chat:write",
                  "access_token" => "xoxp-1234",
                  "token_type" => "user",
                },
              })

              assert_no_difference -> { @organization.integrations.count } do
                sign_in @user
                @member.discard
                assert_raises ActiveRecord::RecordNotFound do
                  get organization_slack_integration_callback_path(@organization.slug), params: { code: "valid", state: @state }
                end
              end
            end

            test "return 403 for an invalid code" do
              ::Slack::Web::Client.any_instance.stubs(:oauth_v2_access).raises(::Slack::Web::Api::Errors::SlackError.new("invalid_auth", "invalid code"))

              sign_in @user
              get organization_slack_integration_callback_path(@organization.slug), params: { code: "invalid", state: @state }
              assert_response :forbidden
            end

            test "return 403 for an org member" do
              org_member = create(:organization_membership, :member, organization: @organization).user

              sign_in org_member
              get organization_slack_integration_callback_path(@organization.slug), params: { code: "valid", state: @state }
              assert_response :forbidden
            end

            test "403s for a random user" do
              sign_in create(:user)

              assert_raises ActiveRecord::RecordNotFound do
                get organization_slack_integration_callback_path(@organization.slug), params: { code: "valid", state: @state }
              end
            end

            test "redirects unauthenticated user to sign in" do
              get organization_slack_integration_callback_path(@organization.slug), params: { code: "valid", state: @state }
              assert_response :redirect
            end
          end
        end
      end
    end
  end
end
