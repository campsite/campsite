# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module OrganizationMemberships
      class ViewerPostsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @user = @member.user
          @organization = @member.organization

          @viewer_post = create(:post, organization: @organization, member: @member)
          @another_viewer_post = create(:post, organization: @organization, member: @member)

          private_project = create(:project, :private, organization: @organization)
          create(:project_membership, project: private_project, organization_membership: @member)
          @private_project_post = create(:post, organization: @organization, member: @member, project: private_project)

          @other_post = create(:post, organization: @organization)
          @discarded_post = create(:post, :discarded, organization: @organization, member: @member)
        end

        context "#index" do
          test "returns paginated posts for the current org member" do
            sign_in @user

            assert_query_count 13 do
              get organization_membership_viewer_posts_path(@organization.slug)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["data"].length
            assert_equal [@private_project_post, @another_viewer_post, @viewer_post].map(&:public_id), json_response["data"].pluck("id")
            assert_not_includes json_response["data"].pluck("id"), @discarded_post.public_id
            assert_not_includes json_response["data"].pluck("id"), @other_post.public_id
          end

          test "sorts by published_at when specified" do
            @viewer_post.update!(published_at: 1.hour.ago)
            @another_viewer_post.update!(published_at: 1.day.ago)
            @private_project_post.update!(published_at: 3.hours.ago)

            sign_in @user
            get organization_membership_viewer_posts_path(@organization.slug),
              params: { order: { by: "published_at", direction: "desc" } }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["data"].length
            assert_equal [@viewer_post, @private_project_post, @another_viewer_post].map(&:public_id), json_response["data"].pluck("id")
          end

          test "returns search results" do
            @another_viewer_post.update!(title: "Needle in a haystack")
            @viewer_post.update!(description_html: "<p>This description has a needle in it</p>")

            create(:post, organization: @organization, title: "Needle in a haystack")
            create(:post, organization: @organization, description_html: "<p>This description has a needle in it</p>")

            Post.reindex

            sign_in @user

            get organization_membership_viewer_posts_path(@organization.slug), params: { q: "needle" }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
            assert_equal [@another_viewer_post, @viewer_post].map(&:public_id).sort, json_response["data"].pluck("id").sort
          end

          test "403s for a non-org member" do
            sign_in create(:user)
            get organization_membership_viewer_posts_path(@organization.slug)

            assert_response :forbidden
          end

          test "401s for a logged-out user" do
            get organization_membership_viewer_posts_path(@organization.slug)

            assert_response :unauthorized
          end

          test "doesn't return drafts" do
            draft_post = create(:post, :draft, organization: @organization, member: @member)

            sign_in @member.user
            get organization_membership_viewer_posts_path(@organization.slug)

            assert_response :ok
            assert_equal 3, json_response["data"].length
            assert_not_includes json_response["data"].pluck("id"), draft_post.public_id
          end
        end
      end
    end
  end
end
