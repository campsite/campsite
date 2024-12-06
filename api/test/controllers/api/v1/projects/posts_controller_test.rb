# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Projects
      class PostsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @user = @member.user
          @organization = @member.organization
          @project = create(:project, organization: @organization)
        end

        context "#index" do
          test "returns paginated posts for an admin" do
            create(:post, organization: @organization, project: @project, last_activity_at: 1.day.ago)
            post_2 = create(:post, organization: @organization, last_activity_at: Time.current, parent: create(:post, organization: @organization), project: @project)
            post_4 = create(:post, :from_integration, last_activity_at: 1.month.ago, organization: @organization, project: @project)
            create(:post, :from_oauth_application, organization: @organization, project: @project, last_activity_at: 1.day.ago)

            sign_in @user
            get organization_project_posts_path(@organization.slug, @project.public_id),
              params: { order: { by: "last_activity_at", direction: "desc" } }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 4, json_response["data"].length
            assert_equal post_2.public_id, json_response["data"].first["id"]
            assert_equal post_4.public_id, json_response["data"].last["id"]
          end

          test "returns paginated posts for a member" do
            create_list(:post, 5, organization: @organization, project: @project)
            sign_in create(:organization_membership, :member, organization: @organization).user
            get organization_project_posts_path(@organization.slug, @project.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 5, json_response["data"].length
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            get organization_project_posts_path(@organization.slug, @project.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_project_posts_path(@organization.slug, @project.public_id)
            assert_response :unauthorized
          end

          test "doesn't use excessive number of queries" do
            5.times do
              post = create(:post, organization: @organization, project: @project, member: create(:organization_membership, :with_status, organization: @organization))
              create(:comment, subject: post, member: create(:organization_membership, :with_status, organization: @organization))
              integration_comment = create(:comment, :from_integration, subject: post)
              create(:comment, :from_oauth_application, subject: post)
              post.resolve!(actor: create(:organization_membership, :with_status, organization: @organization), html: nil, comment_id: integration_comment.public_id)
            end

            sign_in @user

            assert_query_count 24 do
              get organization_project_posts_path(@organization.slug, @project.public_id)
            end

            assert_response :ok
          end

          test "returns query results" do
            post_1 = create(:post, :reindex, title: "Needle in a haystack", organization: @organization, project: @project, last_activity_at: 1.day.ago)
            post_2 = create(:post, :reindex, description_html: "<p>This post has a needle in it</p>", organization: @organization, last_activity_at: Time.current, parent: create(:post, organization: @organization), project: @project)
            create(:post, :reindex, :from_integration, last_activity_at: 1.month.ago, organization: @organization, project: @project)
            create(:post, :reindex, :from_oauth_application, organization: @organization, project: @project, last_activity_at: 1.day.ago)

            sign_in @user
            get organization_project_posts_path(@organization.slug, @project.public_id),
              params: { q: "needle" }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
            assert_equal [post_2, post_1].pluck(:public_id).sort, json_response["data"].pluck("id").sort
          end

          test "doesn't return drafts" do
            create(:post, :draft, organization: @organization, project: @project, member: @member)

            sign_in @user
            get organization_project_posts_path(@organization.slug, @project.public_id)

            assert_response :ok
            assert_equal 0, json_response["data"].length
          end

          test "hides resolved posts" do
            post_1 = create(:post, organization: @organization, project: @project, last_activity_at: 1.day.ago)
            post_2 = create(:post, organization: @organization, last_activity_at: Time.current, parent: create(:post, organization: @organization), project: @project)
            post_3 = create(:post, :from_integration, last_activity_at: 1.month.ago, organization: @organization, project: @project)
            post_4 = create(:post, :from_oauth_application, organization: @organization, project: @project, last_activity_at: 1.day.ago)

            other_member = create(:organization_membership, organization: @organization)
            post_1.resolve!(actor: other_member, html: "<p>Resolved</p>", comment_id: nil)
            post_4.resolve!(actor: other_member, html: "<p>Resolved</p>", comment_id: nil)

            sign_in @user
            get organization_project_posts_path(@organization.slug, @project.public_id),
              params: { order: { by: "last_activity_at", direction: "desc" }, hide_resolved: true }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
            assert_equal post_2.public_id, json_response["data"].first["id"]
            assert_equal post_3.public_id, json_response["data"].last["id"]
          end

          test "includes resolved posts" do
            post_1 = create(:post, organization: @organization, project: @project, last_activity_at: 1.day.ago)
            post_2 = create(:post, organization: @organization, last_activity_at: Time.current, parent: create(:post, organization: @organization), project: @project)
            post_3 = create(:post, :from_integration, last_activity_at: 1.month.ago, organization: @organization, project: @project)
            post_4 = create(:post, :from_oauth_application, organization: @organization, project: @project, last_activity_at: 1.day.ago)

            other_member = create(:organization_membership, organization: @organization)
            post_1.resolve!(actor: other_member, html: "<p>Resolved</p>", comment_id: nil)
            post_4.resolve!(actor: other_member, html: "<p>Resolved</p>", comment_id: nil)

            sign_in @user
            get organization_project_posts_path(@organization.slug, @project.public_id),
              params: { order: { by: "last_activity_at", direction: "desc" }, hide_resolved: false }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 4, json_response["data"].length
            assert_equal [post_1, post_2, post_3, post_4].map(&:public_id).sort, json_response["data"].pluck("id").sort
          end
        end
      end
    end
  end
end
