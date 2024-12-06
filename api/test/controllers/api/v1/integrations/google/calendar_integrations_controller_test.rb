# frozen_string_literal: true

require "test_helper"
require "test_helpers/oauth_test_helper"

module Api
  module V1
    module Integrations
      module Google
        class CalendarIntegrationControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @member = create(:organization_membership)
            @user = @member.user
          end

          describe "#show" do
            test "returns the user's Google Calendar organization from the first organization membership" do
              sign_in @user
              get google_calendar_integration_path

              assert_response :ok
              assert_response_gen_schema
              assert_equal @member.organization.public_id, json_response.dig("organization", "id")
            end

            test "returns the user's Google Calendar organization from billing email domain" do
              matching_org = create(:organization, billing_email: "billing@#{@user.email_domain}")
              create(:organization_membership, user: @user, organization: matching_org)

              sign_in @user
              get google_calendar_integration_path

              assert_response :ok
              assert_response_gen_schema
              assert_equal matching_org.public_id, json_response.dig("organization", "id")
            end

            test "returns the user's Google Calendar organization from google_calendar_organization_id" do
              preference_org = create(:organization_membership, user: @user).organization
              @user.update!(google_calendar_organization_id: preference_org.id)

              sign_in @user
              get google_calendar_integration_path

              assert_response :ok
              assert_response_gen_schema
              assert_equal preference_org.public_id, json_response.dig("organization", "id")
            end

            test "returns installed true when user has access token" do
              create(:access_token, :google_calendar, resource_owner: @user)

              sign_in @user
              get google_calendar_integration_path

              assert_response :ok
              assert_response_gen_schema
              assert_equal true, json_response["installed"]
            end

            test "returns installed false when user does not have access token" do
              sign_in @user
              get google_calendar_integration_path

              assert_response :ok
              assert_response_gen_schema
              assert_equal false, json_response["installed"]
            end

            test "returns unauthorized if the user is not signed in" do
              get google_calendar_integration_path
              assert_response :unauthorized
            end
          end
        end
      end
    end
  end
end
