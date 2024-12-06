# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class PersonalCallRoomsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @member = create(:organization_membership)
        @organization = @member.organization
        @call_room = create(:call_room, subject: @member, organization: @organization, creator: @member)
      end

      context "#show" do
        test "it returns a personal call room" do
          sign_in @member.user

          assert_query_count 7 do
            get organization_membership_personal_call_room_path(@organization.slug)
          end

          assert_response :ok
          assert_response_gen_schema
          assert_equal @call_room.public_id, json_response["id"]
          assert_nil json_response["title"]
          assert_predicate json_response["viewer_token"], :present?
          assert_equal true, json_response["viewer_can_invite_participants"]
        end

        test "creates call room if doesn't already exist" do
          @call_room.destroy!

          sign_in @member.user

          assert_query_count 10 do
            get organization_membership_personal_call_room_path(@organization.slug)
          end

          assert_response :ok
          assert_response_gen_schema
          assert_enqueued_sidekiq_job(CreateHmsCallRoomJob, args: [CallRoom.find_by(public_id: json_response["id"]).id])
          assert_nil json_response["title"]
          assert_equal true, json_response["viewer_can_invite_participants"]
        end

        test "it returns forbidden for a non-organization member" do
          sign_in create(:user)
          get organization_membership_personal_call_room_path(@organization.slug)

          assert_response :forbidden
        end

        test "it returns unauthorized for a logged-out user" do
          get organization_membership_personal_call_room_path(@organization.slug)

          assert_response :unauthorized
        end
      end
    end
  end
end
