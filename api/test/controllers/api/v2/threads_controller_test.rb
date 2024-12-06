# frozen_string_literal: true

require "test_helper"
require "test_helpers/oauth_test_helper"

module Api
  module V2
    class ThreadsControllerTest < ActionDispatch::IntegrationTest
      include OauthTestHelper
      include Devise::Test::IntegrationHelpers

      setup do
        @org = create(:organization)
        @member = create(:organization_membership, organization: @org)
        @org_oauth_app = create(:oauth_application, owner: @org, name: "Campbot")
        @org_app_token = create(:access_token, resource_owner: @org, application: @org_oauth_app)
        @user_app_token = create(:access_token, resource_owner: @member.user, application: @org_oauth_app)
      end

      describe "#create" do
        test "creates a new thread" do
          assert_difference "MessageThread.count", 1 do
            create_thread
          end

          assert_response :created
          assert_response_gen_schema

          thread = MessageThread.last
          assert_equal "Test Thread", thread.title
          assert_equal @org_oauth_app, thread.owner
          assert thread.group
          assert thread.oauth_applications.include?(@org_oauth_app)
          assert_enqueued_sidekiq_job(CreateMessageThreadCallRoomJob, args: [thread.id])
        end

        test "creates a thread with multiple members" do
          other_member = create(:organization_membership, organization: @org)

          create_thread(params: { member_ids: [@member.public_id, other_member.public_id] })

          assert_response :created

          thread = MessageThread.last
          assert_equal 2, thread.organization_memberships.count
          assert_equal [@member, other_member].sort_by(&:id), thread.organization_memberships.sort_by(&:id)
        end

        test "requires member_ids" do
          create_thread(params: { title: "Test Thread" })

          assert_response :bad_request
        end

        test "ignores invalid member_ids" do
          valid_member = create(:organization_membership, organization: @org)
          other_member = create(:organization_membership)

          create_thread(params: { member_ids: [valid_member.public_id, other_member.public_id, "invalid_id"] })

          assert_response :created
          thread = MessageThread.last
          assert_equal 1, thread.organization_memberships.count
          assert_equal [valid_member], thread.organization_memberships
        end

        test "works with a user-scoped token" do
          create_thread(headers: oauth_request_headers(token: @user_app_token.plaintext_token, org_slug: @org.slug))
          assert_response :created
          assert_equal @member, MessageThread.last.owner
        end

        test "returns an error if the title is too long" do
          create_thread(params: { title: "a" * 81 })
          assert_response :bad_request
        end

        test "returns an error if the token is invalid" do
          create_thread(headers: bearer_token_header("invalid_token"))
          assert_response :unauthorized
        end

        test "returns an error if no token is provided" do
          post v2_threads_path(headers: {})
          assert_response :unauthorized
        end

        def create_thread(
          params: { title: "Test Thread", member_ids: [@member.public_id] },
          headers: oauth_request_headers(token: @org_app_token.plaintext_token)
        )
          post(
            v2_threads_path,
            as: :json,
            headers: headers,
            params: params,
          )
        end
      end
    end
  end
end
