# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class CallRoomsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @member = create(:organization_membership)
        @organization = @member.organization
        @message_thread = create(:message_thread, owner: @member, organization_memberships: [@member], title: "A chat")
        @call_room = create(:call_room, subject: @message_thread, organization: @organization)
      end

      context "#show" do
        test "it returns a call room" do
          create_list(:call_peer, 2, :active, call: create(:call, room: @call_room))

          sign_in @member.user

          assert_query_count 6 do
            get organization_call_room_path(@organization.slug, @call_room.public_id)
          end

          assert_response :ok
          assert_response_gen_schema
          assert_equal @call_room.public_id, json_response["id"]
          assert_equal @message_thread.title, json_response["title"]
          assert_predicate json_response["viewer_token"], :present?
          assert_equal false, json_response["viewer_can_invite_participants"]
          assert_equal 2, json_response["active_peers"].size
        end

        test "anyone can access a call room without a subject" do
          @call_room.update!(subject: nil)

          get organization_call_room_path(@organization.slug, @call_room.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal @call_room.public_id, json_response["id"]
          assert_nil json_response["title"]
          assert_predicate json_response["viewer_token"], :present?
          assert_equal true, json_response["viewer_can_invite_participants"]
        end

        test "anyone can access a personal call room" do
          @call_room.update!(subject: create(:organization_membership, organization: @organization))

          get organization_call_room_path(@organization.slug, @call_room.public_id)

          assert_response :ok
          assert_response_gen_schema
          assert_equal @call_room.public_id, json_response["id"]
          assert_nil json_response["title"]
          assert_predicate json_response["viewer_token"], :present?
          assert_equal true, json_response["viewer_can_invite_participants"]
        end

        test "it does not return a token to a call room to a user who doesn't have access" do
          get organization_call_room_path(@organization.slug, @call_room.public_id)

          assert_response :forbidden
        end

        test "it 404s for a bogus organization slug" do
          get organization_call_room_path("foobar", @call_room.public_id)

          assert_response :not_found
        end
      end

      context "#create" do
        test "it enqueues a job to create a call room" do
          sign_in @member.user
          post organization_call_rooms_path(@organization.slug), params: { source: "new_call_button" }

          assert_response :created
          assert_response_gen_schema
          call_room = @organization.call_rooms.last!
          assert_equal call_room.public_id, json_response["id"]
          assert_nil json_response["title"]
          assert_nil json_response["viewer_token"]
          assert_enqueued_sidekiq_job(CreateHmsCallRoomJob, args: [call_room.id])
          assert_equal @member, call_room.creator
          assert_equal "new_call_button", call_room.source
        end

        test "non-org member can't create a call room" do
          sign_in create(:user)
          post organization_call_rooms_path(@organization.slug)

          assert_response :forbidden
        end
      end
    end
  end
end
