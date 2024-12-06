# frozen_string_literal: true

require "test_helper"
require "test_helpers/oauth_test_helper"

module Api
  module V2
    module Threads
      class MessagesControllerTest < ActionDispatch::IntegrationTest
        include OauthTestHelper
        include Devise::Test::IntegrationHelpers

        setup do
          @org = create(:organization)
          @member = create(:organization_membership, organization: @org)
          @org_oauth_app = create(:oauth_application, owner: @org, name: "Campbot")
          @org_app_token = create(:access_token, resource_owner: @org, application: @org_oauth_app)
          @user_app_token = create(:access_token, resource_owner: @member.user, application: @org_oauth_app)
          @thread = create(:message_thread, owner: @member)
          @thread.add_oauth_application!(oauth_application: @org_oauth_app, actor: @member)
          @html = "<p>Test <em>content</em></p>"
        end

        describe "#index" do
          test "returns a list of messages" do
            messages = create_list(:message, 3, message_thread: @thread)

            assert_query_count 10 do
              get v2_thread_messages_path(@thread.public_id), headers: oauth_request_headers(token: @org_app_token.plaintext_token)
            end

            assert_response :success
            assert_equal 3, json_response["data"].count
            assert_equal messages.reverse.map(&:public_id), json_response["data"].pluck("id")
          end

          test "works with a project id for a project that is a chat project" do
            project = create(:project, :chat_project, organization: @org)

            assert_query_count 10 do
              get v2_thread_messages_path(project.public_id), headers: oauth_request_headers(token: @org_app_token.plaintext_token)
            end

            assert_response :success
          end

          test "returns a 404 if the project is not a chat project" do
            project = create(:project)

            get v2_thread_messages_path(project.public_id), headers: oauth_request_headers(token: @org_app_token.plaintext_token)

            assert_response :not_found
          end

          test "returns unauthorized if the token is invalid" do
            get v2_thread_messages_path(@thread.public_id), headers: oauth_request_headers(token: "invalid")
            assert_response :unauthorized
          end

          test "returns unauthorized if the token is missing" do
            get v2_thread_messages_path(@thread.public_id), headers: oauth_request_headers
            assert_response :unauthorized
          end

          test "returns forbidden if the application isn't a member of the thread" do
            @thread.remove_oauth_application!(oauth_application: @org_oauth_app, actor: @member)
            get v2_thread_messages_path(@thread.public_id), headers: oauth_request_headers(token: @org_app_token.plaintext_token)
            assert_response :forbidden
          end
        end

        describe "#create" do
          test "creates a message in a thread" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            create_message

            assert_response :created
            assert_response_gen_schema
            assert_equal @html, @thread.messages.last.content
            assert_equal @org_oauth_app.public_id, json_response["author"]["id"]
          end

          test "replies to a message" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            message = create(:message, message_thread: @thread)

            create_message(params: { content_markdown: "Test *content*", parent_id: message.public_id })

            assert_response :created
            assert_response_gen_schema
            assert_equal @html, @thread.messages.last.content
            assert_equal message.id, @thread.messages.last.reply_to_id
          end

          test "assigns the message to a member when using a user-scoped token" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            create_message(headers: oauth_request_headers(token: @user_app_token.plaintext_token, org_slug: @org.slug))

            assert_response :created
            assert_response_gen_schema
            assert_equal @member, @thread.messages.last.sender
          end

          test "replaces reactions in the message" do
            reaction = create(:custom_reaction, organization: @org, name: "partyparrot")

            html = "<p>Test content <img data-type=\"reaction\" src=\"#{reaction.file_url}\" alt=\"partyparrot\" draggable=\"false\" data-id=\"#{reaction.public_id}\" data-name=\"partyparrot\"></p>"
            StyledText.any_instance.expects(:markdown_to_html).returns(html)

            create_message(params: { content_markdown: "Test content :partyparrot:" })

            assert_response :created
            assert_response_gen_schema
            assert_equal html, json_response["content"]
          end

          test "works with a project id for a project that is a chat project" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            project = create(:project, :chat_project, organization: @org)

            create_message(params: { content_markdown: "Test content" }, thread_id: project.public_id)

            assert_response :created
          end

          test "returns a 404 if the project is not a chat project" do
            project = create(:project)
            create_message(params: { content_markdown: "Test content" }, thread_id: project.public_id)
            assert_response :not_found
          end

          test "uses fallback html if styled text errors" do
            StyledText.any_instance.expects(:markdown_to_html).raises(StyledText::ConnectionFailedError)

            create_message(params: { content_markdown: "Test content" })

            assert_response_gen_schema

            assert_equal "<p>Test content</p>", @thread.messages.last.content
          end

          test "returns an error if there is no content" do
            create_message(params: { content_markdown: " " })
            assert_response :unprocessable_entity
          end

          test "returns an error if the application isn't a member of the thread" do
            @thread.remove_oauth_application!(oauth_application: @org_oauth_app, actor: @member)
            create_message
            assert_response :forbidden
          end

          test "returns an error if the parent message does not belong to the thread" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)
            create_message(params: { content_markdown: "Test content", parent_id: create(:message).public_id })
            assert_response :not_found
          end

          test "returns an error if the token is invalid" do
            create_message(headers: bearer_token_header("invalid_token"))
            assert_response :unauthorized
          end

          test "returns an error if no token is provided" do
            create_message(headers: {})
            assert_response :unauthorized
          end

          def create_message(
            params: { content_markdown: "Test *content*" },
            headers: oauth_request_headers(token: @org_app_token.plaintext_token),
            thread_id: @thread.public_id
          )
            post(
              v2_thread_messages_path(thread_id: thread_id),
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
