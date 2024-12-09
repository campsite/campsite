# frozen_string_literal: true

require "test_helper"
require "test_helpers/oauth_test_helper"

module Api
  module V2
    class PostsControllerTest < ActionDispatch::IntegrationTest
      include OauthTestHelper
      include Devise::Test::IntegrationHelpers

      setup do
        @org = create(:organization)
        @member = create(:organization_membership, organization: @org)
        @org_oauth_app = create(:oauth_application, owner: @org, name: "Campbot")
        @org_app_token = create(:access_token, resource_owner: @org, application: @org_oauth_app)
        @user_app_token = create(:access_token, resource_owner: @member.user, application: @org_oauth_app)
        @project = create(:project, organization: @org)
      end

      describe "#index" do
        setup do
          @posts = create_list(:post, 3, project: @project, organization: @org)
        end

        test "lists posts" do
          assert_query_count 5 do
            list_posts
          end

          assert_response :success
          assert_equal @posts.pluck(:public_id).reverse, json_response["data"].pluck("id")
        end

        test "sorts by recent activity" do
          @posts.last.update(last_activity_at: 1.day.ago)

          list_posts(params: { sort: "last_activity_at", direction: "desc" })

          assert_response :success
          assert_equal @posts[1].public_id, json_response["data"][0]["id"]
        end

        test "does not include posts in private projects" do
          private_project_post = create(:post, project: create(:project, :private, organization: @org), organization: @org)

          list_posts

          assert_response :success
          assert_not json_response["data"].pluck("id").include?(private_project_post.public_id)
        end

        test "returns posts in a public project" do
          project = create(:project, organization: @org)
          create_list(:post, 3, project: project, organization: @org)

          list_posts(params: { channel_id: project.public_id })

          assert_response :success
          assert_equal 3, json_response["data"].count
        end

        test "works with a universal oauth app and an org token" do
          app = create(:oauth_application, :universal)
          token = app.access_tokens.create!(resource_owner: @org)

          list_posts(headers: oauth_request_headers(token: token.plaintext_token))

          assert_response :success
          assert_equal 3, json_response["data"].count
        end

        test "returns an error for a private project if the app is not a member of the project" do
          private_project = create(:project, :private, organization: @org)

          list_posts(params: { channel_id: private_project.public_id })

          assert_response :forbidden
        end

        test "returns posts in private projects if the app is a member of the project" do
          private_project = create(:project, :private, organization: @org)
          private_project.add_oauth_application!(@org_oauth_app)
          create_list(:post, 3, project: private_project, organization: @org)

          list_posts(params: { channel_id: private_project.public_id })

          assert_response :success
          assert_equal 3, json_response["data"].count
        end

        test "paginates results" do
          list_posts(params: { limit: 1, after: @posts[2].public_id })

          assert_response :success
          assert_equal [@posts[1].public_id], json_response["data"].pluck("id")
          assert_not_nil json_response.dig("next_cursor")
        end

        test "returns an error if the order field is invalid" do
          list_posts(params: { order: { by: "id", direction: "desc" } })

          assert_response :unprocessable_entity
        end

        test "returns an error if the limit is too high" do
          list_posts(params: { limit: 51 })

          assert_response :unprocessable_entity
          assert_equal "`limit` must be less than or equal to 50.", json_response["error"]["message"]
        end

        test "works with a user token" do
          list_posts(headers: oauth_request_headers(token: @user_app_token.plaintext_token, org_slug: @org.slug))

          assert_response :success
          assert_equal @posts.pluck(:public_id).reverse, json_response["data"].pluck("id")
        end

        test "returns an error if the token is invalid" do
          list_posts(headers: oauth_request_headers(token: "invalid_token"))
          assert_response :unauthorized
        end

        def list_posts(params: {}, headers: oauth_request_headers(token: @org_app_token.plaintext_token))
          get(v2_posts_path, as: :json, params: params, headers: headers)
        end
      end

      describe "#create" do
        test "creates a new post in a specific project" do
          html = "<p>Test content</p>"
          StyledText.any_instance.expects(:markdown_to_html).returns(html)

          create_post

          assert_response :created
          assert_response_gen_schema

          post = @project.posts.last
          rendered_post = PostSerializer.render_as_hash(post)

          assert_equal html, post.description_html
          assert_equal "Test title", post.title
          assert_equal "Campbot", rendered_post[:member][:user][:display_name]
        end

        test "requires a project id" do
          create_post(params: { content_markdown: "Test content" })

          assert_response :unprocessable_entity
        end

        test "assigns the post to a member when using a user-scoped token" do
          html = "<p>Test content</p>"
          StyledText.any_instance.expects(:markdown_to_html).returns(html)

          create_post(headers: oauth_request_headers(token: @user_app_token.plaintext_token, org_slug: @org.slug))

          rendered_post = PostSerializer.render_as_hash(Post.last)

          assert_response :created
          assert_response_gen_schema
          assert_equal @member.user.public_id, rendered_post[:member][:user][:id]
        end

        test "uses fallback html if styled text errors" do
          StyledText.any_instance.expects(:markdown_to_html).raises(StyledText::ConnectionFailedError)

          create_post

          assert_response_gen_schema

          post = @project.posts.last
          assert_equal "<p>Test content</p>", post.description_html
          assert_equal "Test title", post.title
        end

        test "replaces reactions in the post" do
          reaction = create(:custom_reaction, organization: @org, name: "partyparrot")

          html = "<p>Test content <img data-type=\"reaction\" src=\"#{reaction.file_url}\" alt=\"partyparrot\" draggable=\"false\" data-id=\"#{reaction.public_id}\" data-name=\"partyparrot\"></p>"
          StyledText.any_instance.expects(:markdown_to_html).returns(html)

          create_post(params: { content_markdown: "Test content :partyparrot:", channel_id: @project.public_id })

          assert_response :created
          assert_response_gen_schema
          assert_equal html, json_response["content"]
        end

        test "is backwards compatible with the old 'content' field" do
          html = "<p>Test content</p>"
          StyledText.any_instance.expects(:markdown_to_html).returns(html)

          create_post(params: { content: "Test content", channel_id: @project.public_id })

          assert_response :created
          assert_response_gen_schema
          assert_equal html, json_response["content"]
        end

        test "works with a universal oauth app and an org token" do
          html = "<p>Test content</p>"
          StyledText.any_instance.expects(:markdown_to_html).returns(html)

          create_post(headers: oauth_request_headers(token: @org_app_token.plaintext_token))

          assert_response :created
        end

        test "returns an error if there is no content and no title" do
          create_post(params: { content_markdown: nil, title: nil, channel_id: @project.public_id })
          assert_response :unprocessable_entity
        end

        test "returns an error if posting in a private project using an org token" do
          project = create(:project, :private, organization: @org)

          create_post(params: { content_markdown: "Test content", channel_id: project.public_id })

          assert_response :forbidden
          assert_equal I18n.t("project_policy.create_post?", scope: "pundit"), json_response.dig("error", "message")
        end

        test "posts in a private project if the integration is a member of the project" do
          html = "<p>Test content</p>"
          StyledText.any_instance.expects(:markdown_to_html).returns(html)

          project = create(:project, :private, organization: @org)
          create(:project_membership, project: project, oauth_application: @org_oauth_app)

          create_post(params: { content_markdown: "Test content", channel_id: project.public_id })

          assert_response :created
        end

        test "returns an error if posting in a private project using a user token" do
          project = create(:project, :private, organization: @org)

          create_post(
            headers: oauth_request_headers(token: @user_app_token.plaintext_token, org_slug: @org.slug),
            params: { content_markdown: "Test content", channel_id: project.public_id },
          )

          assert_response :forbidden
        end

        test "allows posting in a private project using a user token if the user is a member of the project" do
          html = "<p>Test content</p>"
          StyledText.any_instance.expects(:markdown_to_html).returns(html)

          project = create(:project, :private, organization: @org)
          create(:project_membership, project: project, organization_membership: @member)

          create_post(
            headers: oauth_request_headers(token: @user_app_token.plaintext_token, org_slug: @org.slug),
            params: { content_markdown: "Test content", channel_id: project.public_id },
          )

          assert_response :created
          assert_response_gen_schema
        end

        test "returns an error if the token is invalid" do
          create_post(headers: bearer_token_header("invalid_token"))
          assert_response :unauthorized
        end

        test "returns an error if no token is provided" do
          post v2_posts_path(headers: {})
          assert_response :unauthorized
        end

        def create_post(
          params: { channel_id: @project.public_id, title: "Test title", content_markdown: "Test content" },
          headers: oauth_request_headers(token: @org_app_token.plaintext_token)
        )
          post(
            v2_posts_path,
            as: :json,
            headers: headers,
            params: params,
          )
        end
      end

      describe "#show" do
        test "gets a post" do
          post = create(:post, project: @project, organization: @org)

          get(v2_post_path(post.public_id), as: :json, headers: oauth_request_headers(token: @org_app_token.plaintext_token))

          assert_response :success
          assert_response_gen_schema
        end

        test "does not return a post in a private project" do
          post = create(:post, project: create(:project, :private, organization: @org), organization: @org)

          get(v2_post_path(post.public_id), as: :json, headers: oauth_request_headers(token: @org_app_token.plaintext_token))

          assert_response :forbidden
        end

        test "returns a post in a private project if the app is a member of the project" do
          post = create(:post, project: create(:project, :private, organization: @org), organization: @org)
          post.project.add_oauth_application!(@org_oauth_app)

          get(v2_post_path(post.public_id), as: :json, headers: oauth_request_headers(token: @org_app_token.plaintext_token))

          assert_response :success
        end

        test "returns an error if the post is not found" do
          get(v2_post_path("non-existent-post-id"), as: :json, headers: oauth_request_headers(token: @org_app_token.plaintext_token))

          assert_response :not_found
        end
      end
    end
  end
end
