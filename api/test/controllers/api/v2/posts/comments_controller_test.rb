# frozen_string_literal: true

require "test_helper"
require "test_helpers/oauth_test_helper"

module Api
  module V2
    module Posts
      class CommentsControllerTest < ActionDispatch::IntegrationTest
        include OauthTestHelper
        include Devise::Test::IntegrationHelpers

        setup do
          @org = create(:organization)
          @member = create(:organization_membership, organization: @org)
          @org_oauth_app = create(:oauth_application, owner: @org, name: "Campbot")
          @org_app_token = create(:access_token, resource_owner: @org, application: @org_oauth_app)
          @user_app_token = create(:access_token, resource_owner: @member.user, application: @org_oauth_app)
          @post = create(:post, organization: @org)
          @html = "<p>Test <em>content</em></p>"
        end

        describe "#index" do
          setup do
            @comments = create_list(:comment, 3, subject: @post)
            @replies = create_list(:comment, 2, parent: @comments.first, subject: @post)
          end

          test "lists comments on a post" do
            assert_query_count 8 do
              list_comments
            end

            assert_response :success
            assert_response_gen_schema
            assert_equal @comments.size, json_response["total_count"]
            assert_equal @comments.map(&:public_id), json_response["data"].pluck("id")
          end

          test "lists replies to a comment" do
            list_comments(params: { parent_id: @comments.first.public_id })

            assert_response :success
            assert_response_gen_schema
            assert_equal @replies.size, json_response["total_count"]
            assert_equal @replies.map(&:public_id), json_response["data"].pluck("id")
          end

          test "returns an error if the parent_id does not belong to the post" do
            comment = create(:comment, subject: create(:post, organization: @org))

            list_comments(params: { parent_id: comment.public_id })
            assert_response :not_found
          end

          test "does not work for a post in a private project" do
            post = create(:post, project: create(:project, :private, organization: @org), organization: @org)
            create_list(:comment, 3, subject: post)

            list_comments(path: v2_post_comments_path(post.public_id))

            assert_response :forbidden
          end

          test "returns comments on a post in a private project if the app is a member of the project" do
            post = create(:post, project: create(:project, :private, organization: @org), organization: @org)
            post.project.add_oauth_application!(@org_oauth_app)
            create_list(:comment, 3, subject: post)

            list_comments(path: v2_post_comments_path(post.public_id))

            assert_response :success
          end

          test "works with a universal oauth app and an org token" do
            app = create(:oauth_application, :universal)
            token = app.access_tokens.create!(resource_owner: @org)

            list_comments(headers: oauth_request_headers(token: token.plaintext_token))

            assert_response :success
            assert_equal @comments.map(&:public_id), json_response["data"].pluck("id")
          end

          test "returns 404 for non-existent post" do
            list_comments(path: v2_post_comments_path("not-found"))
            assert_response :not_found
          end

          test "returns 404 for non-existent comment" do
            list_comments(params: { parent_id: "not-found" })
            assert_response :not_found
          end

          def list_comments(
            path: v2_post_comments_path(@post.public_id),
            params: {},
            headers: oauth_request_headers(token: @org_app_token.plaintext_token)
          )
            get(
              path,
              as: :json,
              headers: headers,
              params: params,
            )
          end
        end

        describe "#create" do
          test "creates a comment on a post" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            create_comment

            assert_response :created
            assert_response_gen_schema
            assert_equal @html, @post.comments.last.body_html
          end

          test "replies to a comment" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            comment = create(:comment, subject: @post)

            create_comment(params: { content_markdown: "Test *content*", parent_id: comment.public_id })

            assert_response :created
            assert_response_gen_schema
            assert_equal @html, @post.comments.last.body_html
            assert_equal comment.id, @post.comments.last.parent_id
          end

          test "does not allow nesting more than one level deep" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            reply_comment = create(:comment, subject: @post, parent: create(:comment, subject: @post))

            create_comment(params: { content_markdown: "Test *content*", parent_id: reply_comment.public_id })

            assert_response :unprocessable_entity
          end

          test "replaces reactions in the comment" do
            reaction = create(:custom_reaction, organization: @org, name: "partyparrot")

            html = "<p>Test content <img data-type=\"reaction\" src=\"#{reaction.file_url}\" alt=\"partyparrot\" draggable=\"false\" data-id=\"#{reaction.public_id}\" data-name=\"partyparrot\"></p>"
            StyledText.any_instance.expects(:markdown_to_html).returns(html)

            create_comment(params: { content_markdown: "Test content :partyparrot:" })

            assert_response :created
            assert_response_gen_schema
            assert_equal html, json_response["content"]
          end

          test "assigns the post to a member when using a user-scoped token" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            create_comment(headers: oauth_request_headers(token: @user_app_token.plaintext_token, org_slug: @org.slug))

            assert_response :created
            assert_response_gen_schema
            assert_equal @member.user.public_id, @post.comments.last.member.user.public_id
          end

          test "uses fallback html if styled text errors" do
            StyledText.any_instance.expects(:markdown_to_html).raises(StyledText::ConnectionFailedError)

            create_comment(params: { content_markdown: "Test content" })

            assert_response_gen_schema

            assert_equal "<p>Test content</p>", @post.comments.last.body_html
          end

          test "returns an error if there is no content" do
            create_comment(params: { content_markdown: " " })
            assert_response :unprocessable_entity
          end

          test "returns an error if the parent comment does not belong to the post" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)
            create_comment(params: { content_markdown: "Test content", parent_id: create(:comment).public_id })
            assert_response :not_found
          end

          test "returns an error if the user is not authorized to create a comment" do
            project = create(:project, :private, organization: @org)
            post = create(:post, project: project, organization: @org)

            post(
              v2_post_comments_path(post.public_id),
              as: :json,
              headers: oauth_request_headers(token: @user_app_token.plaintext_token, org_slug: @org.slug),
              params: { content_markdown: "Test content" },
            )

            assert_response :forbidden
          end

          test "works for a post in a private project if the app is a member of the project" do
            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            project = create(:project, :private, organization: @org)
            project.add_oauth_application!(@org_oauth_app)
            post = create(:post, project: project, organization: @org)
            create(:comment, subject: post)

            create_comment(path: v2_post_comments_path(post.public_id))

            assert_response :success
          end

          test "works with a universal oauth app and an org token" do
            app = create(:oauth_application, :universal)
            token = app.access_tokens.create!(resource_owner: @org)

            StyledText.any_instance.expects(:markdown_to_html).returns(@html)

            create_comment(headers: oauth_request_headers(token: token.plaintext_token))

            assert_response :created
          end

          test "returns an error if the token is invalid" do
            create_comment(headers: bearer_token_header("invalid_token"))
            assert_response :unauthorized
          end

          test "returns an error if no token is provided" do
            create_comment(headers: {})
            assert_response :unauthorized
          end

          test "returns 404 for draft posts" do
            post = create(:post, :draft, organization: @org)

            create_comment(path: v2_post_comments_path(post.public_id))

            assert_response :not_found
          end

          private

          def create_comment(
            path: v2_post_comments_path(@post.public_id),
            params: { content_markdown: "Test *content*" },
            headers: oauth_request_headers(token: @org_app_token.plaintext_token)
          )
            post(
              path,
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
