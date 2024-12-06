# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class PostFeedbackRequestsDismissalControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          @post = create(:post, organization: @organization, member: @member)
          @other_member = create(:organization_membership, organization: @organization)
          @requested_feedback_from_member = create(:organization_membership, organization: @organization)
          @feedback_request = create(:post_feedback_request, post: @post, member: @requested_feedback_from_member)
        end

        context "#create" do
          test "the user the feedback has been requested from can dismiss the request" do
            sign_in @requested_feedback_from_member.user

            post organization_post_feedback_request_dismissal_path(@organization.slug, @post.public_id, @feedback_request.public_id)

            assert_response :created
            assert_response_gen_schema

            assert_not_nil @feedback_request.reload.dismissed_at
          end

          # This can happen if the author requests feedback from someone specific and then delete that specific request
          # Then the user who was requested feedback from can still dismiss the general request
          test "the user the feedback has been requested from can dismiss the request even if it has been discarded" do
            @feedback_request.discard

            sign_in @requested_feedback_from_member.user

            post organization_post_feedback_request_dismissal_path(@organization.slug, @post.public_id, @feedback_request.public_id)

            assert_response :created
            assert_response_gen_schema

            assert_not_nil @feedback_request.reload.dismissed_at
          end

          test "returns a 403 for the post author" do
            sign_in @member.user

            post organization_post_feedback_request_dismissal_path(@organization.slug, @post.public_id, @feedback_request.public_id)

            assert_response :forbidden

            assert_nil @feedback_request.reload.dismissed_at
          end

          test "returns a 403 for non-post author" do
            sign_in @other_member.user
            post organization_post_feedback_request_dismissal_path(@organization.slug, @post.public_id, @feedback_request.public_id)
            assert_response :forbidden
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @member.user
            post organization_post_feedback_request_dismissal_path(@organization.slug, post.public_id, @feedback_request.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
