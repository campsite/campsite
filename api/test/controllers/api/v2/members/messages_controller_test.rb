# frozen_string_literal: true

require "test_helper"
require "test_helpers/oauth_test_helper"

module Api
  module V2
    module Members
      class MessagesControllerTest < ActionDispatch::IntegrationTest
        include OauthTestHelper
        include Devise::Test::IntegrationHelpers

        setup do
          @org = create(:organization)
          @member = create(:organization_membership, organization: @org)
          @org_oauth_app = create(:oauth_application, owner: @org, name: "Campbot")
          @org_app_token = create(:access_token, resource_owner: @org, application: @org_oauth_app)
          @user_app_token = create(:access_token, resource_owner: @member.user, application: @org_oauth_app)
          @html = "<p>Test content</p>"
        end

        describe "#create" do
          test "creates a new thread if one doesn't exist" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            assert_difference "MessageThread.count", 1 do
              create_message
            end

            assert_response :created
            assert_response_gen_schema
            thread = MessageThread.last
            assert_equal @html, thread.messages.last.content
            assert_equal @org_oauth_app.public_id, json_response["author"]["id"]
            assert_equal 2, thread.members_count
          end

          test "uses existing thread if one exists" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            create_message

            created_thread = MessageThread.last

            assert_no_difference "MessageThread.count" do
              StyledText.any_instance.expects(:markdown_to_html).returns(@html)
              create_message
            end

            assert_response :created
            assert_response_gen_schema
            assert_equal created_thread.public_id, MessageThread.last.public_id
          end

          test "replies to a message" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            create_message

            html = "<p>Test reply</p>"
            StyledText.any_instance.expects(:markdown_to_html).returns(html)

            thread = MessageThread.last
            message = thread.messages.last

            create_message(params: { content_markdown: "Test reply", parent_id: message.public_id })

            assert_response :created
            assert_response_gen_schema
            assert_equal html, thread.messages.last.content
            assert_equal message.id, thread.messages.last.reply_to_id
          end

          test "uses fallback html if styled text errors" do
            StyledText.any_instance.expects(:markdown_to_html).raises(StyledText::ConnectionFailedError)

            create_message(params: { content_markdown: "Test content" })

            assert_response_gen_schema

            assert_equal "<p>Test content</p>", MessageThread.last.messages.last.content
          end

          test "returns an error if there is no content" do
            create_message(params: { content_markdown: " " })
            assert_response :unprocessable_entity
          end

          test "returns an error if the token is invalid" do
            create_message(headers: bearer_token_header("invalid_token"))
            assert_response :unauthorized
          end

          test "returns an error if no token is provided" do
            create_message(headers: {})
            assert_response :unauthorized
          end

          test "returns an error if the user is not a member of the organization" do
            member = create(:organization_membership)

            create_message(
              member_id: member.public_id,
              params: { content_markdown: "Test content" },
              headers: oauth_request_headers(token: @org_app_token.plaintext_token),
            )

            assert_response :not_found
          end

          def create_message(
            member_id: @member.public_id,
            params: { content_markdown: "Test content" },
            headers: oauth_request_headers(token: @org_app_token.plaintext_token)
          )
            post(
              v2_member_messages_path(member_id),
              as: :json,
              headers: headers,
              params: params,
            )
          end
        end
      end
    end
  end
end
