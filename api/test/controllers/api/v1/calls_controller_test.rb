# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class CallsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @member = create(:organization_membership)
        @organization = @member.organization
      end

      context "#index" do
        setup do
          @call_1 = create(:call, :completed, room: create(:call_room, organization: @organization))
          create(:call_peer, organization_membership: @member, call: @call_1)
          @call_1.update!(stopped_at: 5.minutes.ago)
          @call_1_recording = create(:call_recording, call: @call_1)

          @call_2 = create(:call, :completed, room: create(:call_room, organization: @organization))
          message_thread = create(:message_thread, owner: @member, organization_memberships: [@member])
          @message_thread_call = create(:call, room: create(:call_room, subject: message_thread), stopped_at: 5.minutes.ago)
          create(:call_recording, call: @message_thread_call)
        end

        test "only returns completed, recorded calls" do
          sign_in(@member.user)

          assert_query_count 11 do
            get organization_calls_path(@organization.slug)
          end

          assert_response :success
          assert_response_gen_schema
          assert_equal 2, json_response["data"].length
          call_response_data = json_response["data"].find { |call| call["id"] == @call_1.public_id }
          assert_equal true, call_response_data["viewer_can_destroy_all_recordings"]
        end

        test "does not return in-progress call" do
          @call_1.update!(stopped_at: nil)
          @message_thread_call.update!(stopped_at: nil)

          sign_in(@member.user)
          get organization_calls_path(@organization.slug)

          assert_response :success
          assert_response_gen_schema
          assert_equal 0, json_response["data"].length
        end

        test "returns only joined calls when specified" do
          sign_in(@member.user)
          get organization_calls_path(@organization.slug), params: { filter: CallsController::JOINED_FILTER }

          assert_response :success
          assert_response_gen_schema
          assert_equal 1, json_response["data"].length
          assert_equal @call_1.public_id, json_response.dig("data", 0, "id")
        end

        test "returns only chat calls when specified" do
          sign_in(@member.user)
          get organization_calls_path(@organization.slug), params: { filter: CallsController::CHATS_FILTER }

          assert_response :success
          assert_response_gen_schema
          assert_equal 1, json_response["data"].length
          assert_equal @message_thread_call.public_id, json_response.dig("data", 0, "id")
        end

        test "includes call without a subject" do
          call_room = create(:call_room, organization: @organization, subject: nil)
          call = create(:call, :completed, room: call_room)
          create(:call_recording, call: call)
          create(:call_peer, organization_membership: @member, call: call)
          logged_in_non_member_peer = create(:call_peer, organization_membership: nil, user: create(:user), call: call)
          logged_out_peer = create(:call_peer, organization_membership: nil, user: nil, call: call, name: "Logged out user")

          sign_in @member.user

          assert_query_count 11 do
            get organization_calls_path(@organization.slug)
          end

          assert_response :success
          assert_response_gen_schema
          call_response_data = json_response["data"].find { |c| c["id"] == call.public_id }
          assert_nil call_response_data["title"]
          member_peer = call_response_data["peers"].find { |peer| peer.dig("member", "id") == @member.public_id }
          assert_equal true, member_peer["member"]["is_organization_member"]
          logged_in_non_member_peer = call_response_data["peers"].find { |peer| peer.dig("member", "user", "id") == logged_in_non_member_peer.user.public_id }
          assert_equal false, logged_in_non_member_peer["member"]["is_organization_member"]
          logged_out_peer_response = call_response_data["peers"].find { |peer| peer.dig("member", "user", "display_name") == logged_out_peer.name }
          assert_equal false, logged_out_peer_response["member"]["is_organization_member"]
        end

        test "returns calls in public projects you belong to" do
          project = create(:project, organization: @organization)
          call = create(:call, :completed, :recorded, room: create(:call_room, organization: @organization))
          call.add_to_project!(project: project)
          project.add_member!(@member)

          sign_in @member.user
          get organization_calls_path(@organization.slug)

          assert_response :success
          assert_response_gen_schema
          assert_includes json_response["data"].pluck("id"), call.public_id
        end

        test "returns calls in private projects you belong to" do
          project = create(:project, :private, organization: @organization)
          call = create(:call, :completed, :recorded, room: create(:call_room, organization: @organization))
          call.add_to_project!(project: project)
          project.add_member!(@member)

          sign_in @member.user
          get organization_calls_path(@organization.slug)

          assert_response :success
          assert_response_gen_schema
          assert_includes json_response["data"].pluck("id"), call.public_id
        end

        test "does not return calls in public projects you don't belong to" do
          project = create(:project, organization: @organization)
          call = create(:call, :completed, :recorded, room: create(:call_room, organization: @organization))
          call.add_to_project!(project: project)

          sign_in @member.user
          get organization_calls_path(@organization.slug)

          assert_response :success
          assert_response_gen_schema
          assert_not_includes json_response["data"].pluck("id"), call.public_id
        end

        test "returns search results for all calls" do
          @call_1.update!(title: "Needle in a haystack")
          create(:call_peer, organization_membership: create(:organization_membership, organization: @organization), call: @call_1)
          create(:call_peer, organization_membership: create(:organization_membership, organization: @organization), call: @call_1)

          Call.reindex

          sign_in(@member.user)

          get organization_calls_path(@organization.slug), params: { q: "needle" }

          assert_response :success
          assert_response_gen_schema
          assert_equal 1, json_response["data"].length
          assert_equal @call_1.public_id, json_response.dig("data", 0, "id")
          assert_equal 3, json_response["data"][0]["peers"].length
        end

        test "returns search results for joined calls" do
          @call_1.update!(title: "Needle in a haystack")
          create(:call_peer, organization_membership: create(:organization_membership, organization: @organization), call: @call_1)
          create(:call_peer, organization_membership: create(:organization_membership, organization: @organization), call: @call_1)

          Call.reindex

          sign_in(@member.user)

          get organization_calls_path(@organization.slug), params: { q: "needle", filter: CallsController::JOINED_FILTER }

          assert_response :success
          assert_response_gen_schema
          assert_equal 1, json_response["data"].length
          assert_equal @call_1.public_id, json_response.dig("data", 0, "id")
          assert_equal 3, json_response["data"][0]["peers"].length
        end

        test "403s for non-org member" do
          sign_in(create(:user))

          get organization_calls_path(@organization.slug)

          assert_response :forbidden
        end

        test "401s for logged-out user" do
          get organization_calls_path(@organization.slug)

          assert_response :unauthorized
        end
      end

      context "#show" do
        setup do
          @call = create(:call, room: create(:call_room, organization: @organization))
          create(:call_peer, call: @call, organization_membership: @member)
        end

        test "call participant can show the call" do
          sign_in(@member.user)

          assert_query_count 11 do
            get organization_call_path(@organization.slug, @call.public_id)
          end

          assert_response :success
          assert_response_gen_schema
          assert_equal @call.public_id, json_response["id"]
          assert_equal true, json_response["viewer_can_edit"]
          assert_equal true, json_response["viewer_can_destroy_all_recordings"]
        end

        test "non-participant in the message thread can show the call" do
          member = create(:organization_membership, organization: @organization)
          @call.room.subject.memberships.create!(organization_membership: member)

          sign_in(member.user)
          get organization_call_path(@organization.slug, @call.public_id)

          assert_response :success
          assert_response_gen_schema
          assert_equal @call.public_id, json_response["id"]
          assert_equal false, json_response["viewer_can_edit"]
          assert_equal false, json_response["viewer_can_destroy_all_recordings"]
        end

        test "org member can see call in public project" do
          member = create(:organization_membership, organization: @organization)
          project = create(:project, organization: @organization)
          @call.add_to_project!(project: project)

          sign_in(member.user)
          get organization_call_path(@organization.slug, @call.public_id)

          assert_response :success
          assert_response_gen_schema
          assert_equal @call.public_id, json_response["id"]
          assert_equal false, json_response["viewer_can_edit"]
          assert_equal false, json_response["viewer_can_destroy_all_recordings"]
        end

        test "org member can edit call in public project with edit permission" do
          member = create(:organization_membership, organization: @organization)
          project = create(:project, organization: @organization)
          @call.add_to_project!(project: project, permission: :edit)

          sign_in(member.user)
          get organization_call_path(@organization.slug, @call.public_id)

          assert_response :success
          assert_response_gen_schema
          assert_equal @call.public_id, json_response["id"]
          assert_equal true, json_response["viewer_can_edit"]
          assert_equal true, json_response["viewer_can_destroy_all_recordings"]
        end

        test "private project member can see call" do
          member = create(:organization_membership, organization: @organization)
          project = create(:project, :private, organization: @organization)
          project.add_member!(member)
          @call.add_to_project!(project: project)

          sign_in(member.user)
          get organization_call_path(@organization.slug, @call.public_id)

          assert_response :success
          assert_response_gen_schema
          assert_equal @call.public_id, json_response["id"]
        end

        test "non-private project member can't see call" do
          member = create(:organization_membership, organization: @organization)
          project = create(:project, :private, organization: @organization)
          @call.add_to_project!(project: project)

          sign_in(member.user)
          get organization_call_path(@organization.slug, @call.public_id)

          assert_response :forbidden
        end

        test "403s for user who shouldn't have access" do
          sign_in(create(:user))
          get organization_call_path(@organization.slug, @call.public_id)

          assert_response :forbidden
        end

        test "401s for logged-out user" do
          get organization_call_path(@organization.slug, @call.public_id)

          assert_response :unauthorized
        end
      end

      context "#update" do
        setup do
          @call = create(:call, organization: @organization)
          @call_peer = create(:call_peer, call: @call, organization_membership: @member)
          @new_title = "An important meeting"
          @new_summary = "In this meeting, we discussed very important businessperson things."
        end

        test "call participant can set title and summary" do
          sign_in(@member.user)

          assert_query_count 19 do
            put organization_call_path(@organization.slug, @call.public_id), params: { title: @new_title, summary: @new_summary }
          end

          assert_response :success
          assert_response_gen_schema
          assert_equal @new_title, json_response["title"]
          assert_equal @new_summary, json_response["summary_html"]
        end

        test "org member can edit when public project has edit permission" do
          member = create(:organization_membership, organization: @organization)
          project = create(:project, organization: @organization)
          @call.add_to_project!(project: project, permission: :edit)

          sign_in member.user
          put organization_call_path(@organization.slug, @call.public_id), params: { title: @new_title, summary: @new_summary }

          assert_response :success
          assert_response_gen_schema
          assert_equal @new_title, json_response["title"]
          assert_equal @new_summary, json_response["summary_html"]
        end

        test "private project member can edit when project has edit permission" do
          member = create(:organization_membership, organization: @organization)
          project = create(:project, :private, organization: @organization)
          project.add_member!(member)
          @call.add_to_project!(project: project, permission: :edit)

          sign_in member.user
          put organization_call_path(@organization.slug, @call.public_id), params: { title: @new_title, summary: @new_summary }

          assert_response :success
          assert_response_gen_schema
          assert_equal @new_title, json_response["title"]
          assert_equal @new_summary, json_response["summary_html"]
        end

        test "org member can't edit when public project has view permission" do
          member = create(:organization_membership, organization: @organization)
          project = create(:project, organization: @organization)
          @call.add_to_project!(project: project, permission: :view)

          sign_in member.user
          put organization_call_path(@organization.slug, @call.public_id), params: { title: @new_title, summary: @new_summary }

          assert_response :forbidden
        end

        test "non-private-project member can't edit when project has edit permission" do
          member = create(:organization_membership, organization: @organization)
          project = create(:project, :private, organization: @organization)
          @call.add_to_project!(project: project, permission: :edit)

          sign_in member.user
          put organization_call_path(@organization.slug, @call.public_id), params: { title: @new_title, summary: @new_summary }

          assert_response :forbidden
        end

        test "403s for non-call participant" do
          sign_in(create(:user))
          put organization_call_path(@organization.slug, @call.public_id), params: { title: @new_title, summary: @new_summary }

          assert_response :forbidden
        end

        test "401s for logged-out user" do
          put organization_call_path(@organization.slug, @call.public_id), params: { title: @new_title, summary: @new_summary }

          assert_response :unauthorized
        end
      end
    end
  end
end
