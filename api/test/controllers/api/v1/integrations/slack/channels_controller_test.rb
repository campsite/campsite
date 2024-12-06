# frozen_string_literal: true

require "test_helper"
require "test_helpers/slack_test_helper"

module Api
  module V1
    module Integrations
      module Slack
        class ChannelsControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @admin_member = create(:organization_membership)
            @organization = @admin_member.organization
            @integration = create(:integration, :slack, owner: @organization)
          end

          describe "#index" do
            test "returns Slack channels for organization admin" do
              channel = create(:integration_channel, integration: @integration)

              sign_in @admin_member.user
              get organization_integrations_slack_channels_path(@organization.slug)

              assert_response :ok
              assert_response_gen_schema
              assert_equal 1, json_response["data"].length
              response_channel = json_response["data"].first
              assert_equal channel.provider_channel_id, response_channel["id"]
              assert_equal channel.name, response_channel["name"]
              assert_not response_channel["is_private"]
            end

            it "supports search query" do
              matching_channel = create(:integration_channel, integration: @integration, name: "foo")
              create(:integration_channel, integration: @integration, name: "bar")

              sign_in @admin_member.user
              get organization_integrations_slack_channels_path(@organization.slug, params: { q: matching_channel.name })

              assert_response :ok
              assert_response_gen_schema
              assert_equal 1, json_response["data"].length
              assert_equal matching_channel.name, json_response["data"].first["name"]
            end

            it "returns private Slack channels to members" do
              member = create(:organization_membership, :member, organization: @organization)
              slack_user_id = create(:slack_user_id, organization_membership: member, integration: @integration)
              private_channel = create(:integration_channel, integration: @integration, private: true)
              create(:integration_channel_member, integration_channel: private_channel, provider_member_id: slack_user_id.value)

              sign_in member.user.reload
              get organization_integrations_slack_channels_path(@organization.slug)

              assert_response :ok
              assert_response_gen_schema
              assert_equal 1, json_response["data"].length
              assert_equal private_channel.name, json_response["data"].first["name"]
            end

            it "does not return private Slack channels to non-members" do
              member = create(:organization_membership, :member, organization: @organization)
              create(:integration_channel, integration: @integration, private: true)

              sign_in member.user.reload
              get organization_integrations_slack_channels_path(@organization.slug)

              assert_response :ok
              assert_response_gen_schema
              assert_equal 0, json_response["data"].length
            end

            it "returns Slack channels for organization member" do
              member = create(:organization_membership, :member, organization: @organization)
              create(:integration_channel, integration: @integration)

              sign_in member.user
              get organization_integrations_slack_channels_path(@organization.slug)

              assert_response :ok
              assert_response_gen_schema
              assert_equal 1, json_response["data"].length
            end

            it "returns forbidden for non-organization member" do
              sign_in create(:user)
              get organization_integrations_slack_channels_path(@organization.slug)

              assert_response :forbidden
            end

            it "returns unauthorized for logged-out user" do
              get organization_integrations_slack_channels_path(@organization.slug)

              assert_response :unauthorized
            end
          end

          describe "#show" do
            before(:each) do
              @channel = create(:integration_channel, integration: @integration)
            end

            test "returns a Slack channel by Slack channel ID for organization admin" do
              sign_in @admin_member.user
              get organization_integrations_slack_channel_path(@organization.slug, @channel.provider_channel_id)

              assert_response :ok
              assert_response_gen_schema
              assert_equal @channel.provider_channel_id, json_response["id"]
              assert_equal @channel.name, json_response["name"]
              assert_not json_response["is_private"]
            end

            it "returns Slack channel for organization member" do
              member = create(:organization_membership, :member, organization: @organization)

              sign_in member.user
              get organization_integrations_slack_channel_path(@organization.slug, @channel.provider_channel_id)

              assert_response :ok
              assert_response_gen_schema
              assert_equal @channel.provider_channel_id, json_response["id"]
              assert_equal @channel.name, json_response["name"]
              assert_not json_response["is_private"]
            end

            it "returns forbidden when channel doesn't exist" do
              sign_in create(:user)
              get organization_integrations_slack_channel_path(@organization.slug, "not-a-real-channel-id")

              assert_response :forbidden
            end

            it "returns forbidden for non-organization member" do
              sign_in create(:user)
              get organization_integrations_slack_channel_path(@organization.slug, @channel.provider_channel_id)

              assert_response :forbidden
            end

            it "returns unauthorized for logged-out user" do
              get organization_integrations_slack_channel_path(@organization.slug, @channel.provider_channel_id)

              assert_response :unauthorized
            end
          end
        end
      end
    end
  end
end
