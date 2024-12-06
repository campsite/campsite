# frozen_string_literal: true

require "test_helper"
require "test_helpers/zapier_test_helper"

module Api
  module V1
    module Integrations
      module Zapier
        class MessagesControllerTest < ActionDispatch::IntegrationTest
          include ZapierTestHelper
          include Devise::Test::IntegrationHelpers

          setup do
            @thread = create(:message_thread, :dm)
            @organization = @thread.owner.organization
            @integration = create(:integration, :zapier, owner: @organization)
          end

          describe "#create" do
            test "creates a message in a specific thread" do
              html = "<p>Test content</p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              post zapier_integration_messages_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  thread_id: @thread.public_id,
                  content: "Test content",
                }

              assert_response_gen_schema
              assert_equal html, @thread.messages.last.content
            end

            test "creates a message as a reply" do
              html = "<p>Test content</p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              message = create(:message, message_thread: @thread)
              post zapier_integration_messages_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  content: "Test content",
                  parent_id: message.public_id,
                }

              assert_response_gen_schema
              assert_equal html, @thread.messages.last.content
              assert_equal message.public_id, @thread.messages.last.reply_to.public_id
            end

            test "uses fallback html if styled text errors" do
              StyledText.any_instance.expects(:markdown_to_html).raises(StyledText::ConnectionFailedError)

              message = create(:message, message_thread: @thread)
              post zapier_integration_messages_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  content: "Test content",
                  parent_id: message.public_id,
                }

              assert_response_gen_schema
              assert_equal "Test content", @thread.messages.last.content
              assert_equal message.public_id, @thread.messages.last.reply_to.public_id
            end

            test "returns an error if there is no content" do
              post zapier_integration_messages_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  thread_id: @thread.public_id,
                }

              assert_response :unprocessable_entity
            end

            test "returns an error if the thread does not exist" do
              html = "<p>Test content</p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              post zapier_integration_messages_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  thread_id: "invalid",
                  content: "Test content",
                }

              assert_response :not_found
            end

            test "returns an error if the thread does not belong to the organization" do
              html = "<p>Test content</p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              thread = create(:message_thread)
              post zapier_integration_messages_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  thread_id: thread.public_id,
                  content: "Test content",
                }

              assert_response :unprocessable_entity
            end

            test "returns an error if the parent_id message does not exist" do
              html = "<p>Test content</p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              post zapier_integration_messages_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  content: "Test content",
                  parent_id: "invalid",
                }

              assert_response :not_found
            end

            test "returns an error if the parent_id message does not belong to the organization" do
              other_thread = create(:message_thread)
              message = create(:message, message_thread: other_thread)

              html = "<p>Test content</p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              post zapier_integration_messages_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  content: "Test content",
                  parent_id: message.public_id,
                }

              assert_response :unprocessable_entity
            end

            test "returns an error if the thread_id and parent_id are both specified" do
              message = create(:message, message_thread: @thread)

              html = "<p>Test content</p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              post zapier_integration_messages_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  thread_id: @thread.public_id,
                  content: "Test content",
                  parent_id: message.public_id,
                }

              assert_response :unprocessable_entity
            end

            test "creates a message in a specific thread using an oauth token" do
              token = create(:access_token, :zapier, resource_owner: @organization)

              html = "<p>Test content</p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              post zapier_integration_messages_path,
                as: :json,
                headers: zapier_oauth_request_headers(token.plaintext_token),
                params: {
                  thread_id: @thread.public_id,
                  content: "Test content",
                }

              rendered_message = MessageSerializer.render_as_hash(@thread.messages.last)

              assert_response_gen_schema
              assert_equal html, @thread.messages.last.content
              assert_equal "Zapier", rendered_message[:sender][:user][:display_name]
            end
          end
        end
      end
    end
  end
end
