# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module OrganizationMemberships
      class PersonalDraftPostsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @user = @member.user
          @organization = @member.organization

          @draft_post = create(:post, :draft, organization: @organization, member: @member)
          @another_draft_post = create(:post, :draft, organization: @organization, member: @member)
          @published_post = create(:post, organization: @organization, member: @member)
          @other_member_draft_post = create(:post, :draft, organization: @organization)
          @other_member_published_post = create(:post, organization: @organization)
        end

        context "#index" do
          test "returns paginated draft posts for the current org member" do
            sign_in @user

            assert_query_count 13 do
              get organization_membership_personal_draft_posts_path(@organization.slug)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
            assert_equal [@another_draft_post, @draft_post].map(&:public_id), json_response["data"].pluck("id")
            assert_not_includes json_response["data"].pluck("id"), @published_post.public_id
            assert_not_includes json_response["data"].pluck("id"), @other_member_published_post.public_id
            assert_not_includes json_response["data"].pluck("id"), @other_member_draft_post.public_id
          end

          test "sorts by last_activity_at when specified" do
            @draft_post.update!(last_activity_at: 1.day.ago)
            @another_draft_post.update!(last_activity_at: 1.hour.ago)

            sign_in @user
            get organization_membership_personal_draft_posts_path(@organization.slug),
              params: { order: { by: "last_activity_at", direction: "asc" } }

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
            assert_equal [@draft_post, @another_draft_post].map(&:public_id), json_response["data"].pluck("id")
          end

          test "403s for a non-org member" do
            sign_in create(:user)
            get organization_membership_personal_draft_posts_path(@organization.slug)

            assert_response :forbidden
          end

          test "401s for a logged-out user" do
            get organization_membership_personal_draft_posts_path(@organization.slug)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
