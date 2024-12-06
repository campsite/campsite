# frozen_string_literal: true

require "test_helper"
require "test_helpers/oauth_test_helper"

module Api
  module V1
    module Integrations
      module CalDotCom
        class CallRoomsControllerTest < ActionDispatch::IntegrationTest
          include OauthTestHelper

          setup do
            @member = create(:organization_membership)
            @user = @member.user
            @access_token = create(:access_token, :cal_dot_com, resource_owner: @user)
          end

          describe "#create" do
            test "returns a new call room URL for the current user" do
              post cal_dot_com_call_rooms_path, headers: bearer_token_header(@access_token.plaintext_token)

              assert_response :created
              assert_response_gen_schema
              assert_predicate json_response["id"], :present?
              assert_predicate json_response["url"], :present?
              call_room = CallRoom.find_by(public_id: json_response["id"])
              assert_enqueued_sidekiq_job(CreateHmsCallRoomJob, args: [call_room.id])
              assert_equal @member, call_room.creator
              assert_equal "cal_dot_com", call_room.source
            end

            test "uses organization where billing email domain matches user email domain when exists" do
              matching_org = create(:organization, billing_email: "billing@#{@user.email_domain}")
              create(:organization_membership, user: @user, organization: matching_org)

              post cal_dot_com_call_rooms_path, headers: bearer_token_header(@access_token.plaintext_token)

              assert_response :created
              assert_response_gen_schema
              call_room = CallRoom.find_by(public_id: json_response["id"])
              assert_equal matching_org, call_room.organization
            end

            test "uses organization from preference when exists" do
              matches_billing_email_org = create(:organization, billing_email: "billing@#{@user.email_domain}")
              create(:organization_membership, user: @user, organization: matches_billing_email_org)
              preference_org = create(:organization_membership, user: @user).organization
              @user.find_or_initialize_preference(:cal_dot_com_organization_id).update!(value: preference_org.id)

              post cal_dot_com_call_rooms_path, headers: bearer_token_header(@access_token.plaintext_token)

              assert_response :created
              assert_response_gen_schema
              call_room = CallRoom.find_by(public_id: json_response["id"])
              assert_equal preference_org, call_room.organization
            end

            test "destroys preference and falls back to another organization if organization membership for preference not found" do
              preference_org = create(:organization)
              preference = @user.find_or_initialize_preference(:cal_dot_com_organization_id)
              preference.update!(value: preference_org.id)

              post cal_dot_com_call_rooms_path, headers: bearer_token_header(@access_token.plaintext_token)

              assert_response :created
              assert_response_gen_schema
              call_room = CallRoom.find_by(public_id: json_response["id"])
              assert_equal @member.organization, call_room.organization
              assert_not UserPreference.exists?(preference.id)
            end

            test "does not return a call room URL for an unauthenticated user" do
              post cal_dot_com_call_rooms_path

              assert_response :unauthorized
            end

            test "returns a 401 for an access token missing write_call_room scope" do
              @access_token.update!(scopes: "read_organization")

              post cal_dot_com_call_rooms_path, headers: bearer_token_header(@access_token.plaintext_token)

              assert_response :forbidden
            end
          end
        end
      end
    end
  end
end
