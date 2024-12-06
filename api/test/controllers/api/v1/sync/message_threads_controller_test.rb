# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Sync
      class MessageThreadsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          @new_thread_members = create_list(:organization_membership, 3, organization: @organization)
          @threads = [
            create(:message_thread, :dm, owner: @member),
            create(:message_thread, :dm, organization_memberships: [@member]),
            create(:message_thread, :group, owner: @member),
            create(:message_thread, :group, organization_memberships: [@member, create(:organization_membership, organization: @organization)]),
          ]

          @non_viewer_threads = [
            # in-org threads
            create(:message_thread, :group, organization_memberships: @new_thread_members),
            create(:message_thread, :dm, organization_memberships: [@new_thread_members[0]]),
            # other-org threads
            create(:message_thread, :group),
            create(:message_thread, :dm),
          ]
        end

        context "#index" do
          test "returns threads and dm-able members" do
            sign_in @member.user
            get organization_sync_message_threads_path(@organization.slug)

            assert_response :ok
            assert_response_gen_schema

            response_thread_ids = json_response["threads"].pluck("id")
            assert_includes response_thread_ids, @threads[0].public_id
            assert_includes response_thread_ids, @threads[1].public_id
            assert_includes response_thread_ids, @threads[2].public_id
            assert_includes response_thread_ids, @threads[3].public_id

            assert_not_includes response_thread_ids, @non_viewer_threads[0].public_id
            assert_not_includes response_thread_ids, @non_viewer_threads[1].public_id
            assert_not_includes response_thread_ids, @non_viewer_threads[2].public_id
            assert_not_includes response_thread_ids, @non_viewer_threads[3].public_id

            new_thread_member_ids = json_response["new_thread_members"].pluck("id")
            assert_includes new_thread_member_ids, @new_thread_members[0].public_id
            assert_includes new_thread_member_ids, @new_thread_members[1].public_id
            assert_includes new_thread_member_ids, @new_thread_members[2].public_id
          end

          test "query count" do
            sign_in @member.user
            assert_query_count 5 do
              get organization_sync_message_threads_path(@organization.slug)
            end
          end
        end
      end
    end
  end
end
