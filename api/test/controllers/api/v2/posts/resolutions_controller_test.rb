# frozen_string_literal: true

require "test_helper"
require "test_helpers/oauth_test_helper"

module Api
  module V2
    module Posts
      class ResolutionsControllerTest < ActionDispatch::IntegrationTest
        include OauthTestHelper
        include Devise::Test::IntegrationHelpers

        setup do
          @org = create(:organization)
          @member = create(:organization_membership, organization: @org)
          @org_oauth_app = create(:oauth_application, owner: @org, name: "Campbot")
          @org_app_token = create(:access_token, resource_owner: @org, application: @org_oauth_app)
          @user_app_token = create(:access_token, resource_owner: @member.user, application: @org_oauth_app)
          @post = create(:post, organization: @org)
          @html = "<p>Test <em>resolution</em></p>"
        end

        describe "#create" do
          test "resolves a post" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            assert_query_count 10 do
              resolve_post
            end

            assert_response :created
            assert_response_gen_schema
            assert json_response["resolution"]["resolved_at"].present?
            assert_equal @org_oauth_app.public_id, json_response["resolution"]["resolved_by"]["id"]
            assert_predicate @post.reload, :resolved?
            assert_equal @html, @post.resolved_html
          end

          test "does not require resolution content" do
            resolve_post(params: {})
            assert_response :created
            assert_predicate @post.reload, :resolved?
          end

          test "resolves from a comment" do
            comment = create(:comment, subject: @post)

            resolve_post(
              params: { comment_id: comment.public_id },
            )

            assert_response :created
            assert_response_gen_schema
            assert json_response["resolution"]["resolved_at"].present?
            assert_equal @org_oauth_app.public_id, json_response["resolution"]["resolved_by"]["id"]
            assert_equal comment.public_id, json_response["resolution"]["resolved_comment"]["id"]
            assert_predicate @post.reload, :resolved?
            assert_equal @org_oauth_app, @post.resolved_by
            assert_equal comment, @post.resolved_comment
          end

          test "returns 404 if the comment does not belong to the post" do
            comment = create(:comment, subject: create(:post, organization: @org))

            resolve_post(
              params: { comment_id: comment.public_id },
            )

            assert_response :not_found
          end

          test "does not work for a post in a private project" do
            project = create(:project, :private, organization: @org)
            post = create(:post, project: project, organization: @org)

            resolve_post(post_id: post.public_id)

            assert_response :forbidden
          end

          test "works for a post in a private project if the app is a member of the project" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            project = create(:project, :private, organization: @org)
            project.add_oauth_application!(@org_oauth_app)
            post = create(:post, project: project, organization: @org)

            resolve_post(post_id: post.public_id)

            assert_response :success
          end

          test "attributes the resolution to the member if the token is scoped to a user" do
            resolve_post(params: {}, headers: oauth_request_headers(token: @user_app_token.plaintext_token, org_slug: @org.slug))
            assert_response :success
            assert_equal @member, @post.reload.resolved_by
          end

          test "returns an error if the token is invalid" do
            resolve_post(headers: bearer_token_header("invalid_token"))
            assert_response :unauthorized
          end

          test "returns an error if no token is provided" do
            resolve_post(headers: {})
            assert_response :unauthorized
          end

          test "returns 404 for draft posts" do
            post = create(:post, :draft, organization: @org)

            resolve_post(post_id: post.public_id)

            assert_response :not_found
          end

          def resolve_post(
            post_id: @post.public_id,
            params: { content_markdown: "Test *resolution*" },
            headers: oauth_request_headers(token: @org_app_token.plaintext_token)
          )
            post(
              v2_post_resolution_path(post_id),
              as: :json,
              headers: headers,
              params: params,
            )
          end
        end

        describe "#destroy" do
          test "unresolves a post" do
            post = create(:post, :resolved, organization: @org)

            delete_resolution(post.public_id)

            assert_response :ok
            assert_not_predicate post.reload, :resolved?
            assert_nil post.resolved_html
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [post.channel_name, "invalidate-post", { post_id: post.public_id }.to_json])
          end

          test "does not work for a post in a private project" do
            project = create(:project, :private, organization: @org)
            post = create(:post, project: project, organization: @org)

            delete_resolution(post.public_id)

            assert_response :forbidden
          end

          test "works for a post in a private project if the app is a member of the project" do
            project = create(:project, :private, organization: @org)
            project.add_oauth_application!(@org_oauth_app)
            post = create(:post, project: project, organization: @org)

            delete_resolution(post.public_id)

            assert_response :success
            assert_not_predicate post.reload, :resolved?
          end

          test "returns 404 for draft posts" do
            post = create(:post, :draft, organization: @org)

            delete_resolution(post.public_id)

            assert_response :not_found
          end

          private

          def delete_resolution(
            post_id,
            headers: oauth_request_headers(token: @org_app_token.plaintext_token)
          )
            delete(
              v2_post_resolution_path(post_id),
              as: :json,
              headers: headers,
            )
          end
        end
      end
    end
  end
end
