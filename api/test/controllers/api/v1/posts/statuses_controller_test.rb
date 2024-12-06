# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class StatusesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @author_member = create(:organization_membership, :member)
          @organization = @author_member.organization
          @post = create(:post, organization: @organization, member: @author_member)
        end

        context "#update" do
          test "post author can update status" do
            sign_in(@author_member.user)
            put organization_post_status_path(@organization.slug, @post.public_id), params: { status: "feedback_requested" }

            assert_response :no_content
            assert_equal "feedback_requested", @post.reload.status
          end

          test "admin can update status" do
            admin_member = create(:organization_membership, organization: @organization)

            sign_in admin_member.user
            put organization_post_status_path(@organization.slug, @post.public_id), params: { status: "feedback_requested" }

            assert_response :no_content
            assert_equal "feedback_requested", @post.reload.status
          end

          test "returns unprocessable entity for invalid status" do
            sign_in(@author_member.user)
            put organization_post_status_path(@organization.slug, @post.public_id), params: { status: "not-a-status" }

            assert_response :unprocessable_entity
            assert_equal "none", @post.reload.status
          end

          it "returns forbidden for non-organization member" do
            sign_in create(:user)
            put organization_post_status_path(@organization.slug, @post.public_id), params: { status: "not-a-status" }

            assert_response :forbidden
          end

          test "returns unauthorized for logged-out user" do
            put organization_post_status_path(@organization.slug, @post.public_id), params: { status: "not-a-status" }

            assert_response :unauthorized
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @author_member.user
            put organization_post_status_path(@organization.slug, post.public_id), params: { status: "not-a-status" }

            assert_response :not_found
          end
        end
      end
    end
  end
end
