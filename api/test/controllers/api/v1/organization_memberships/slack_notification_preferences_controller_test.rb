# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module OrganizationMemberships
      class SlackNotificationPreferencesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @integration_organization_membership = create(:integration_organization_membership)
          @member = @integration_organization_membership.organization_membership
        end

        describe "#show" do
          it "returns true when the user has enabled Slack notifications" do
            @member.enable_slack_notifications!

            sign_in @member.user
            get organization_membership_slack_notification_preference_path(@member.organization)

            assert_response :ok
            assert_response_gen_schema
            assert JSON.parse(response.body)["enabled"]
          end

          it "returns false when the user has disabled Slack notifications" do
            sign_in @member.user
            get organization_membership_slack_notification_preference_path(@member.organization)

            assert_response :ok
            assert_response_gen_schema
            assert_not JSON.parse(response.body)["enabled"]
          end

          it "401s when the user is not logged in" do
            get organization_membership_slack_notification_preference_path(@member.organization)

            assert_response :unauthorized
          end
        end

        describe "#create" do
          it "enables Slack notifications" do
            sign_in @member.user
            post organization_membership_slack_notification_preference_path(@member.organization)

            @member.reload
            assert_response :created
            assert_response_gen_schema
            assert_predicate @member, :slack_notifications_enabled?
            assert_enqueued_sidekiq_job(SlackConnectedConfirmationJob, args: [@integration_organization_membership.id])
          end

          it "returns 422 when the user has already enabled Slack notifications" do
            @member.enable_slack_notifications!

            sign_in @member.user
            post organization_membership_slack_notification_preference_path(@member.organization)

            assert_response :unprocessable_entity
          end

          it "401s when the user is not logged in" do
            post organization_membership_slack_notification_preference_path(@member.organization)

            assert_response :unauthorized
          end
        end

        describe "#destroy" do
          it "disables Slack notifications" do
            @member.enable_slack_notifications!

            sign_in @member.user
            delete organization_membership_slack_notification_preference_path(@member.organization)

            assert_response :no_content
            assert_not_predicate @member, :slack_notifications_enabled?
          end

          it "returns 422 when the user has already disabled Slack notifications" do
            sign_in @member.user
            delete organization_membership_slack_notification_preference_path(@member.organization)

            assert_response :unprocessable_entity
          end

          it "401s when the user is not logged in" do
            delete organization_membership_slack_notification_preference_path(@member.organization)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
