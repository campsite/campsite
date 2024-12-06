# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module OrganizationMemberships
      class ForMePostsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @user = @member.user
          @organization = @member.organization

          open_project = create(:project, organization: @organization)
          create(:project_membership, project: open_project, organization_membership: @member)
          @joined_open_project_post = create(:post, organization: @organization, project: open_project)
          @joined_open_project_deleted_post = create(:post, :discarded, organization: @organization, project: open_project)

          private_project = create(:project, :private, organization: @organization)
          create(:project_membership, project: private_project, organization_membership: @member)
          @joined_private_project_post = create(:post, organization: @organization, project: private_project)

          archived_project = create(:project, :archived, organization: @organization)
          archived_project.archive!(create(:organization_membership, organization: @organization))
          create(:project_membership, project: archived_project, organization_membership: @member)
          @joined_archived_project_post = create(:post, organization: @organization, project: archived_project)

          other_open_project = create(:project, organization: @organization)
          @other_open_project_post = create(:post, organization: @organization, project: other_open_project)

          other_private_project = create(:project, :private, organization: @organization)
          @other_private_project_post = create(:post, organization: @organization, project: other_private_project)

          @subscribed_post = create(:post, organization: @organization, subscribers: [@user])

          @other_post = create(:post, organization: @organization)
        end

        context "#index" do
          test "returns paginated posts for the current org member" do
            # Ensure comments don't cause N+1
            create_list(:comment, 3, subject: @joined_open_project_post)
            create_list(:comment, 3, subject: @joined_private_project_post)

            sign_in @user

            assert_query_count 15 do
              get organization_membership_for_me_posts_path(@organization.slug)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["data"].length
            assert_equal [@subscribed_post, @joined_private_project_post, @joined_open_project_post].map(&:public_id), json_response["data"].pluck("id")
            assert_not_includes json_response["data"].pluck("id"), @joined_open_project_deleted_post.public_id
            assert_not_includes json_response["data"].pluck("id"), @joined_archived_project_post.public_id
            assert_not_includes json_response["data"].pluck("id"), @other_post.public_id
            assert_not_includes json_response["data"].pluck("id"), @other_open_project_post.public_id
            assert_not_includes json_response["data"].pluck("id"), @other_private_project_post.public_id
          end

          test "sorts by published_at when specified" do
            @joined_private_project_post.update!(published_at: 1.day.ago)
            @joined_open_project_post.update!(published_at: 1.hour.ago)

            sign_in @user
            get organization_membership_for_me_posts_path(@organization.slug),
              params: { order: { by: "published_at", direction: "desc" } }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["data"].length
            assert_equal [@subscribed_post, @joined_open_project_post, @joined_private_project_post].map(&:public_id), json_response["data"].pluck("id")
          end

          test "hides resolved posts" do
            other_member = create(:organization_membership, organization: @organization)
            @joined_private_project_post.resolve!(actor: other_member, html: "<p>Resolved</p>", comment_id: nil)
            @joined_open_project_post.resolve!(actor: other_member, html: "<p>Resolved</p>", comment_id: nil)

            sign_in @user

            get organization_membership_for_me_posts_path(@organization.slug), params: { hide_resolved: true }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 1, json_response["data"].length
            assert_equal [@subscribed_post].map(&:public_id), json_response["data"].pluck("id")
            assert_not_includes json_response["data"].pluck("id"), @joined_open_project_post.public_id
            assert_not_includes json_response["data"].pluck("id"), @joined_private_project_post.public_id
          end

          test "includes resolved posts" do
            other_member = create(:organization_membership, organization: @organization)
            @joined_private_project_post.resolve!(actor: other_member, html: "<p>Resolved</p>", comment_id: nil)
            @joined_open_project_post.resolve!(actor: other_member, html: "<p>Resolved</p>", comment_id: nil)

            sign_in @user

            get organization_membership_for_me_posts_path(@organization.slug), params: { hide_resolved: false }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["data"].length
            assert_equal [@subscribed_post, @joined_private_project_post, @joined_open_project_post].map(&:public_id), json_response["data"].pluck("id")
          end

          test "403s for a non-org member" do
            sign_in create(:user)
            get organization_membership_for_me_posts_path(@organization.slug)

            assert_response :forbidden
          end

          test "401s for a logged-out user" do
            get organization_membership_for_me_posts_path(@organization.slug)

            assert_response :unauthorized
          end

          test "search returns matches" do
            @subscribed_post.update!(title: "Needle in a haystack")
            @joined_private_project_post.update!(description_html: "<p>This description has a needle in it</p>")

            Post.reindex

            sign_in @user

            get organization_membership_for_me_posts_path(@organization.slug), params: { q: "needle" }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
            assert_includes json_response["data"].pluck("id"), @subscribed_post.public_id
            assert_includes json_response["data"].pluck("id"), @joined_private_project_post.public_id
          end

          test "doesn't return drafts" do
            draft_post = create(:post, :draft, organization: @organization, member: @member)

            sign_in @member.user
            get organization_membership_for_me_posts_path(@organization.slug)

            assert_response :ok
            assert_equal 3, json_response["data"].length
            assert_not_includes json_response["data"].pluck("id"), draft_post.public_id
          end
        end
      end
    end
  end
end
