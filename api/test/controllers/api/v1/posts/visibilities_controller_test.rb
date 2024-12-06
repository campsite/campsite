# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class VisibilitiesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @post = create(:post)
          @organization = @post.organization
          @author_member = @post.member
          @other_member = create(:organization_membership, :member, organization: @organization)
        end

        context "#update" do
          test "post author can make a post public visibility" do
            sign_in(@author_member.user)
            put organization_post_visibility_path(@organization.slug, @post.public_id), params: { visibility: "public" }

            assert_response :no_content
            assert_equal "public", @post.reload.visibility
          end

          test "post author can make a post default visibility" do
            @post.update!(visibility: "public")

            sign_in(@author_member.user)
            put organization_post_visibility_path(@organization.slug, @post.public_id), params: { visibility: "default" }

            assert_response :no_content
            assert_equal "default", @post.reload.visibility
          end

          test "another organization member can make a post public visibility" do
            sign_in(@other_member.user)
            put organization_post_visibility_path(@organization.slug, @post.public_id), params: { visibility: "public" }

            assert_response :no_content
            assert_equal "public", @post.reload.visibility
          end

          test "returns unprocessable entity for invalid status" do
            sign_in(@author_member.user)
            put organization_post_visibility_path(@organization.slug, @post.public_id), params: { visibility: "not-a-visiblity" }

            assert_response :unprocessable_entity
            assert_equal "default", @post.reload.visibility
          end

          it "returns forbidden for non-organization member" do
            sign_in(create(:user))
            put organization_post_visibility_path(@organization.slug, @post.public_id), params: { visibility: "public" }

            assert_response :forbidden
          end

          test "returns unauthorized for logged-out user" do
            put organization_post_visibility_path(@organization.slug, @post.public_id), params: { visibility: "public" }

            assert_response :unauthorized
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @author_member.user
            put organization_post_visibility_path(@organization.slug, post.public_id), params: { visibility: "public" }

            assert_response :not_found
          end
        end
      end
    end
  end
end
