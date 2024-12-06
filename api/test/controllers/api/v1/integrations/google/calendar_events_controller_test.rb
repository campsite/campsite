# frozen_string_literal: true

require "test_helper"
require "test_helpers/oauth_test_helper"

module Api
  module V1
    module Integrations
      module Google
        class CalendarEventsTest < ActionDispatch::IntegrationTest
          include OauthTestHelper

          setup do
            @member = create(:organization_membership)
            @user = @member.user
            @access_token = create(:access_token, :google_calendar, resource_owner: @user)
          end

          describe "#create" do
            test "returns a new call room URL for the current user" do
              post google_calendar_events_path, headers: bearer_token_header(@access_token.plaintext_token)

              assert_response :created
              assert_response_gen_schema
              assert_equal @user.email, json_response["adminEmail"]
              assert_predicate json_response["id"], :present?
              assert_predicate json_response["videoUri"], :present?
              call_room = CallRoom.find_by(public_id: json_response["id"])
              assert_enqueued_sidekiq_job(CreateHmsCallRoomJob, args: [call_room.id])
              assert_equal @member, call_room.creator
              assert_equal "google_calendar", call_room.source
            end

            test "uses organization where billing email domain matches user email domain when exists" do
              matching_org = create(:organization, billing_email: "billing@#{@user.email_domain}")
              create(:organization_membership, user: @user, organization: matching_org)

              post google_calendar_events_path, headers: bearer_token_header(@access_token.plaintext_token)

              assert_response :created
              assert_response_gen_schema
              call_room = CallRoom.find_by(public_id: json_response["id"])
              assert_equal matching_org, call_room.organization
            end

            test "uses organization from google_calendar_organization_id when exists" do
              matches_billing_email_org = create(:organization, billing_email: "billing@#{@user.email_domain}")
              create(:organization_membership, user: @user, organization: matches_billing_email_org)
              preference_org = create(:organization)
              create(:organization_membership, user: @user, organization: preference_org)
              @user.update!(google_calendar_organization_id: preference_org.id)

              post google_calendar_events_path, headers: bearer_token_header(@access_token.plaintext_token)

              assert_response :created
              assert_response_gen_schema
              call_room = CallRoom.find_by(public_id: json_response["id"])
              assert_equal preference_org, call_room.organization
            end

            test "nulls google_calendar_organization_id and falls back to another organization if organization membership not found" do
              preference_org = create(:organization)
              @user.update!(google_calendar_organization_id: preference_org.id)

              post google_calendar_events_path, headers: bearer_token_header(@access_token.plaintext_token)

              assert_response :created
              assert_response_gen_schema
              call_room = CallRoom.find_by(public_id: json_response["id"])
              assert_equal @member.organization, call_room.organization
              assert_nil @user.reload.google_calendar_organization_id
            end

            test "does not return a call room URL for an unauthenticated user" do
              post google_calendar_events_path

              assert_response :ok
              assert_equal "AUTH", json_response["error"]
            end

            test "returns a 401 for an access token missing write_call_room scope" do
              @access_token.update!(scopes: "read_organization")

              post google_calendar_events_path, headers: bearer_token_header(@access_token.plaintext_token)

              assert_response :forbidden
            end
          end
        end
      end
    end
  end
end
