# frozen_string_literal: true

require "test_helper"
require "test_helpers/zapier_test_helper"

module Api
  module V1
    module Integrations
      module Zapier
        class PostsControllerTest < ActionDispatch::IntegrationTest
          include ZapierTestHelper
          include Devise::Test::IntegrationHelpers

          setup do
            @organization = create(:organization)
            @integration = create(:integration, :zapier, owner: @organization)
          end

          describe "#create" do
            test "creates a new post in a specific project" do
              project = create(:project, organization: @organization)

              html = "<p>Test content</p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              post zapier_integration_posts_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  project_id: project.public_id,
                  title: "Test title",
                  content: "Test content",
                }

              assert_response_gen_schema

              post = project.posts.last
              assert_equal html, post.description_html
              assert_equal "Test title", post.title
            end

            test "creates a post using an oauth token" do
              project = create(:project, organization: @organization)
              token = create(:access_token, :zapier, resource_owner: @organization)

              html = "<p>Test content</p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              post(
                zapier_integration_posts_path,
                as: :json,
                headers: zapier_oauth_request_headers(token.plaintext_token),
                params: {
                  project_id: project.public_id,
                  content: "Test content",
                },
              )

              post = project.posts.last
              rendered_post = PostSerializer.render_as_hash(post)

              assert_response_gen_schema
              assert_equal html, post.description_html
              assert_nil post.title
              assert_equal "Zapier", rendered_post[:member][:user][:display_name]
            end

            test "creates a new post in the general project if no project is specified" do
              create(:integration, :zapier, owner: @organization)
              create(:project, organization: @organization, is_general: true)

              html = "<p>Test content</p>"
              StyledText.any_instance.expects(:markdown_to_html).returns(html)

              post zapier_integration_posts_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  content: "Test content",
                }

              assert_response_gen_schema
              assert_equal @organization.general_project.public_id, json_response["project_id"]
            end

            test "uses fallback html if styled text errors" do
              project = create(:project, organization: @organization)

              StyledText.any_instance.expects(:markdown_to_html).raises(StyledText::ConnectionFailedError)

              post zapier_integration_posts_path(@organization.slug),
                as: :json,
                headers: zapier_app_request_headers(@integration.token),
                params: {
                  project_id: project.public_id,
                  title: "Test title",
                  content: "Test content",
                }

              assert_response_gen_schema

              post = project.posts.last
              assert_equal "<p>Test content</p>", post.description_html
              assert_equal "Test title", post.title
            end

            test "returns an error if there is no content" do
              assert_difference -> { Post.count }, 0 do
                post zapier_integration_posts_path(@organization.slug),
                  as: :json,
                  headers: zapier_app_request_headers(@integration.token),
                  params: {
                    title: "Test title",
                  }
              end

              assert_response :unprocessable_entity
            end

            test "returns an error if the integration token is invalid" do
              assert_difference -> { Post.count }, 0 do
                post zapier_integration_posts_path(@organization.slug),
                  as: :json,
                  headers: zapier_app_request_headers("invalid_token"),
                  params: {
                    content: "Test content",
                  }
              end

              assert_response :unauthorized
            end

            test "returns an error if the integration is not a Zapier integration" do
              integration = create(:integration, owner: @organization)

              assert_difference -> { Post.count }, 0 do
                post zapier_integration_posts_path(@organization.slug),
                  as: :json,
                  headers: zapier_app_request_headers(integration.token),
                  params: {
                    content: "Test content",
                  }
              end

              assert_response :unauthorized
            end

            test "returns an error if no token is provided" do
              assert_difference -> { Post.count }, 0 do
                post zapier_integration_posts_path(@organization.slug),
                  as: :json,
                  params: {
                    content: "Test content",
                  }
              end

              assert_response :unauthorized
            end
          end
        end
      end
    end
  end
end
