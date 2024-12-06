# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class PostFeedbackDismissalsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          @post = create(:post, organization: @organization, member: @member)
          @other_member = create(:organization_membership, organization: @organization)
        end

        context "#create" do
          test "creates a dismissed feedback request for people who can view the post" do
            sign_in @member.user

            assert_nil @post.feedback_requests.first

            post organization_post_feedback_dismissals_path(@organization.slug, @post.public_id)

            assert_response_gen_schema
            assert_response :created

            feedback_request = @post.feedback_requests.first
            assert feedback_request.dismissed_at
            assert_equal @member, feedback_request.member
          end

          test "dismisses a specific feedback request for people who can view the post" do
            feedback_request = create(:post_feedback_request, post: @post, member: @member)

            sign_in @member.user

            post organization_post_feedback_dismissals_path(@organization.slug, @post.public_id)

            assert_response_gen_schema
            assert_response :created

            assert feedback_request.reload.dismissed_at
            assert_equal @member, feedback_request.member
          end

          test "returns a 403 for people who can't view the post" do
            sign_in create(:organization_membership).user
            post organization_post_feedback_dismissals_path(@organization.slug, @post.public_id)
            assert_response :forbidden
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @member.user
            post organization_post_feedback_dismissals_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
