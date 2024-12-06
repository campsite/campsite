# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class SlackIntegratControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @member = create(:organization_membership)
        @user = @member.user
        @organization = @user.organizations.first
      end

      describe "#ack" do
        before do
          @signing_secret = Rails.application.credentials.slack.signing_secret
        end

        test "works for a valid slack signature" do
          params = {
            token: "X34FAqCu8tmGEkEEpoDncnja",
            challenge: "P7sFXA4o3HV2hTx4zb4zcQ9yrvuQs8pDh6EacOxmMRj0tJaXfQFF",
            type: "url_verification",
          }
          digest = OpenSSL::Digest.new("SHA256")
          timestamp = Time.current.to_i
          base_string = ["v0", timestamp, params.to_json].join(":")
          hex_hash = OpenSSL::HMAC.hexdigest(digest, @signing_secret, base_string)
          computed_signature = ["v0", hex_hash].join("=")

          post slack_integration_ack_path,
            params: params,
            as: :json,
            headers: {
              "HTTP_X_SLACK_REQUEST_TIMESTAMP" => timestamp,
              "HTTP_X_SLACK_SIGNATURE" => computed_signature,
            }
          assert_response :ok
        end

        test "return 403 for an invalid slack signature" do
          post slack_integration_ack_path,
            params: { a: "some data" },
            as: :json,
            headers: {
              "HTTP_X_SLACK_REQUEST_TIMESTAMP" => Time.current.to_i,
              "HTTP_X_SLACK_SIGNATURE" => "invalid",
            }
          assert_response :forbidden
        end
      end

      describe "#show" do
        setup do
          @integration = create(:integration, provider: :slack, owner: @organization)
        end

        test "includes a token for an org admin" do
          sign_in @user
          get organization_slack_integration_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_equal @integration.token, json_response["token"]
          assert_not json_response["has_link_unfurling_scopes"]
          assert_not json_response["only_scoped_for_notifications"]
        end

        test "includes when the integration has scopes for link unfurling" do
          @integration.find_or_initialize_data(IntegrationData::SCOPES).update!(value: "links:read,links:write")

          sign_in @user
          get organization_slack_integration_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert json_response["has_link_unfurling_scopes"]
          assert_not json_response["only_scoped_for_notifications"]
        end

        test "indicates when the integration only has scopes for notifications" do
          @integration.find_or_initialize_data(IntegrationData::SCOPES).update!(value: "im:write,chat:write")

          sign_in @user
          get organization_slack_integration_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_not json_response["has_link_unfurling_scopes"]
          assert json_response["only_scoped_for_notifications"]
        end

        test "indicates when the current member has linked to Slack" do
          slack_user_id = "U0KRQLJ9H"
          integration_organization_membership = @integration.integration_organization_memberships.create!(organization_membership: @member)
          integration_organization_membership.data.create!({ name: IntegrationOrganizationMembershipData::INTEGRATION_USER_ID, value: slack_user_id })

          sign_in @user
          get organization_slack_integration_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert json_response["current_organization_membership_is_linked"]
        end

        test "indicates when the current member has not linked to Slack" do
          sign_in @user
          get organization_slack_integration_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema

          assert_not json_response["current_organization_membership_is_linked"]
        end

        test "includes team ID" do
          team_id = "team-foobar"
          @integration.data.create!(name: IntegrationData::TEAM_ID, value: team_id)

          sign_in @user
          get organization_slack_integration_path(@organization.slug)

          assert_response :ok
          assert_response_gen_schema
          assert_equal team_id, json_response["team_id"]
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          get organization_slack_integration_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          get organization_slack_integration_path(@organization.slug)
          assert_response :unauthorized
        end
      end

      describe "#destroy" do
        setup do
          Slack::Web::Client.any_instance.stubs(:apps_uninstall)
          @integration = create(:integration, provider: :slack, owner: @organization)
        end

        test "works for an org admin" do
          project = create(:project, organization: @organization)
          project.update_column(:slack_channel_id, "prj-slack-id")

          sign_in @user
          delete organization_slack_integration_path(@organization.slug)

          assert_response :no_content

          assert_nil project.reload.slack_channel_id
        end

        test "does not work for an org member" do
          org_member = create(:organization_membership, :member, organization: @organization).user

          sign_in org_member
          delete organization_slack_integration_path(@organization.slug)

          assert_response :forbidden
          assert @organization.reload.slack_integration
        end

        test "return 403 for a random user" do
          sign_in create(:user)
          delete organization_slack_integration_path(@organization.slug)
          assert_response :forbidden
        end

        test "return 401 for an unauthenticated user" do
          delete organization_slack_integration_path(@organization.slug)
          assert_response :unauthorized
        end
      end
    end
  end
end
