# frozen_string_literal: true

require "test_helper"
require "test_helpers/zapier_test_helper"

module Api
  module V1
    module Integrations
      module Zapier
        class CommentsControllerTest < ActionDispatch::IntegrationTest
          include ZapierTestHelper
          include Devise::Test::IntegrationHelpers

          setup do
            @post = create(:post)
            @organization = @post.organization
            @integration = create(:integration, :zapier, owner: @organization)
          end

          describe "#create!" do
            test "creates a comment on a post" do
              html = "<p>Test <em>content</em></p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              post zapier_integration_comments_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  post_id: @post.public_id,
                  content: "Test *content*",
                }

              assert_response_gen_schema
              assert_equal html, @post.comments.last.body_html
            end

            test "creates a comment on a post using an oauth token" do
              token = create(:access_token, :zapier, resource_owner: @organization)

              html = "<p>Test <em>content</em></p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              post zapier_integration_comments_path,
                as: :json,
                headers: zapier_oauth_request_headers(token.plaintext_token),
                params: {
                  post_id: @post.public_id,
                  content: "Test *content*",
                }

              rendered_comment = CommentSerializer.render_as_hash(@post.comments.last)

              assert_response_gen_schema
              assert_equal html, @post.comments.last.body_html
              assert_equal "Zapier", rendered_comment[:member][:user][:display_name]
            end

            test "replies to a comment" do
              comment = create(:comment, subject: @post)

              html = "<p>Test content</p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              post zapier_integration_comments_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  content: "Test content",
                  parent_id: comment.public_id,
                }

              assert_response_gen_schema
              assert_equal html, @post.comments.last.body_html
              assert_equal comment.public_id, @post.comments.last.parent.public_id
            end

            test "uses fallback html if styled text errors" do
              StyledText.any_instance.expects(:markdown_to_html).raises(StyledText::ConnectionFailedError)

              post zapier_integration_comments_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  post_id: @post.public_id,
                  content: "Test content",
                }

              assert_equal "<p>Test content</p>", @post.comments.last.body_html
            end

            test "returns an error if there is no content" do
              post zapier_integration_comments_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  post_id: @post.public_id,
                }

              assert_response :unprocessable_entity
            end

            test "returns an error if the comment is nested more than one level deep" do
              StyledText.any_instance.expects(:markdown_to_html).raises(StyledText::ConnectionFailedError)

              comment = create(:comment, subject: @post)
              reply = create(:comment, subject: @post, parent: comment)

              post zapier_integration_comments_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  content: "Test content",
                  parent_id: reply.public_id,
                }

              assert_response :unprocessable_entity
            end

            test "returns an error if the post does not exist" do
              post zapier_integration_comments_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  post_id: "invalid",
                  content: "Test content",
                }

              assert_response :not_found
            end

            test "returns an error if the post does not belong to the organization" do
              other_post = create(:post)
              post zapier_integration_comments_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  post_id: other_post.public_id,
                  content: "Test content",
                }

              assert_response :unprocessable_entity
            end

            test "returns an error if the parent_id comment does not exist" do
              post zapier_integration_comments_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  content: "Test content",
                  parent_id: "invalid",
                }

              assert_response :not_found
            end

            test "returns an error if the parent_id comment does not belong to the organization" do
              other_post = create(:post)
              comment = create(:comment, subject: other_post)

              post zapier_integration_comments_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  content: "Test content",
                  parent_id: comment.public_id,
                }

              assert_response :unprocessable_entity
            end

            test "returns an error if post_id and parent_id are both specified" do
              comment = create(:comment, subject: @post)

              post zapier_integration_comments_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  post_id: @post.public_id,
                  content: "Test content",
                  parent_id: comment.public_id,
                }

              assert_response :unprocessable_entity
            end

            test "returns an error with an invalid token" do
              post zapier_integration_comments_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers("invalid"),
                params: {
                  post_id: @post.public_id,
                  content: "Test content",
                }

              assert_response :unauthorized
            end
          end
        end
      end
    end
  end
end
