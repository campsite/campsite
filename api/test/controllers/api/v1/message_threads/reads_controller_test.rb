# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module MessageThreads
      class ReadsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          @thread = create(:message_thread, :dm, owner: @member)
          @thread_membership = @thread.memberships.find_by!(organization_membership: @member)
        end

        context "#create" do
          test("it marks the thread as read") do
            last_read = 1.day.ago
            @thread_membership.update!(last_read_at: last_read)

            sign_in @member.user
            post organization_thread_reads_path(@organization.slug, @thread.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert @thread_membership.reload.last_read_at > last_read
            assert_nil json_response["messages"][@organization.slug]
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@member.user.channel_name, "thread-marked-read", @thread.public_id.to_json])
          end

          test("query count") do
            sign_in @member.user

            assert_query_count 8 do
              post organization_thread_reads_path(@organization.slug, @thread.public_id)
            end
          end

          test("it returns an error if the user is not a member of the thread") do
            other_member = create(:organization_membership, organization: @organization)
            sign_in other_member.user

            post organization_thread_reads_path(@organization.slug, @thread.public_id)

            assert_response :not_found
          end
        end

        context "#destroy" do
          test "it marks the thread as unread" do
            message = create(:message, message_thread: @thread)
            @thread.update!(latest_message: message)
            last_read_at = 1.day.ago
            @thread_membership.update!(last_read_at: last_read_at)

            sign_in @member.user
            delete organization_thread_reads_path(@organization.slug, @thread.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal message.created_at - 1, @thread_membership.reload.last_read_at
            assert_equal 1, json_response["messages"][@organization.slug]
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@member.user.channel_name, "thread-marked-unread", @thread.public_id.to_json])
          end

          test "query count" do
            sign_in @member.user

            assert_query_count 8 do
              delete organization_thread_reads_path(@organization.slug, @thread.public_id)
            end
          end

          test "it returns an error if the user is not a member of the thread" do
            other_member = create(:organization_membership, organization: @organization)

            sign_in other_member.user
            delete organization_thread_reads_path(@organization.slug, @thread.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
