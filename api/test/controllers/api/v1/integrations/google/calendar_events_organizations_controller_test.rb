# frozen_string_literal: true

require "test_helper"
require "test_helpers/oauth_test_helper"

module Api
  module V1
    module Integrations
      module Google
        class CalendarEventsOrganzizationsControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @member = create(:organization_membership)
            @user = @member.user
          end

          describe "#update" do
            test "updates the user's Google Calendar organization" do
              google_calendar_org = create(:organization_membership, user: @user).organization

              sign_in @user
              put google_calendar_events_organization_path, params: { organization_id: google_calendar_org.public_id }

              assert_response :no_content
              assert_equal google_calendar_org, @user.reload.google_calendar_organization
            end

            test "returns not found if no organization membership" do
              sign_in @user
              put google_calendar_events_organization_path, params: { organization_id: create(:organization).public_id }

              assert_response :not_found
            end

            test "returns unauthorized if user is not signed in" do
              put google_calendar_events_organization_path, params: { organization_id: create(:organization).public_id }
              assert_response :unauthorized
            end
          end
        end
      end
    end
  end
end
