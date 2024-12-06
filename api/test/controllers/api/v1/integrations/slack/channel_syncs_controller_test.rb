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

          describe "#create" do
            test "enqueues Slack channel sync job for organization admin" do
              sign_in @admin_member.user
              post organization_integrations_slack_channel_syncs_path(@organization.slug)

              assert_response :no_content
              assert_enqueued_sidekiq_job(SyncSlackChannelsV2Job, { args: [@integration.id] })
            end

            test "does not enqueue Slack channel sync job if no Slack integration" do
              organization = create(:organization)
              admin_member = create(:organization_membership, organization: organization)

              sign_in admin_member.user
              post organization_integrations_slack_channel_syncs_path(organization.slug)

              assert_response :no_content
              refute_enqueued_sidekiq_job(SyncSlackChannelsV2Job)
            end

            test "enqueues Slack channel sync job for organization member" do
              member = create(:organization_membership, :member, organization: @organization)

              sign_in member.user
              post organization_integrations_slack_channel_syncs_path(@organization.slug)

              assert_response :no_content
              assert_enqueued_sidekiq_job(SyncSlackChannelsV2Job, { args: [@integration.id] })
            end

            it "returns forbidden for non-organization member" do
              sign_in create(:user)
              post organization_integrations_slack_channel_syncs_path(@organization.slug)

              assert_response :forbidden
            end

            it "returns unauthorized for logged-out user" do
              post organization_integrations_slack_channel_syncs_path(@organization.slug)

              assert_response :unauthorized
            end
          end
        end
      end
    end
  end
end
