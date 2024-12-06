# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class PostFeedbackRequestsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          @post = create(:post, organization: @organization, member: @member)
          @other_member = create(:organization_membership, organization: @organization)
        end

        context "#create" do
          test "post creator can add feedback which triggers a notification" do
            sign_in @member.user

            post organization_post_feedback_requests_path(@organization.slug, @post.public_id),
              params: { member_id: @other_member.public_id }

            assert_response :created
            assert_response_gen_schema

            assert_equal 1, @post.kept_feedback_requests.size
            assert_equal @post.kept_feedback_requests.first.public_id, json_response["id"]
            assert_equal 1, @post.kept_feedback_requests.first.events.size
          end

          test "can create a feedback request for a non-project member in private project" do
            project = create(:project, organization: @organization, private: true)
            post = create(:post, organization: @organization, project: project, member: @member)
            create(:project_membership, organization_membership: @member, project: project)

            sign_in @member.user

            post organization_post_feedback_requests_path(@organization.slug, post.public_id),
              params: { member_id: @other_member.public_id }

            assert_response :created
            assert_response_gen_schema

            assert_equal 1, post.kept_feedback_requests.size
          end

          test "can create a feedback request for project member in private project" do
            project = create(:project, organization: @organization, private: true)
            post = create(:post, organization: @organization, project: project, member: @member)
            create(:project_membership, organization_membership: @member, project: project)
            create(:project_membership, organization_membership: @other_member, project: project)

            sign_in @member.user

            post organization_post_feedback_requests_path(@organization.slug, post.public_id),
              params: { member_id: @other_member.public_id }

            assert_response :created
            assert_response_gen_schema

            assert_equal 1, post.kept_feedback_requests.size
          end

          test "can create a feedback request with requested user when the user dismissed a previous feedback request" do
            sign_in @member.user
            create(:post_feedback_request, :dismissed, post: @post, member: @other_member)

            post organization_post_feedback_requests_path(@organization.slug, @post.public_id),
              params: { member_id: @other_member.public_id }

            assert_response :created
            assert_response_gen_schema

            assert_equal 1, @post.kept_feedback_requests.size
            assert_equal @post.kept_feedback_requests.first.public_id, json_response["id"]
            assert_equal 2, @post.kept_feedback_requests.first.events.size
          end

          # This happens in the case where the author asks for feedback from a specific person, but then change your mind and discard it (discarded_at gets set)
          # The user in question then dismisses the feedback in the UI (dismissed_at gets set)
          # The author changes their mind and adds the user back to the feedback request (dismissed_at gets set to nil)
          test "can re-request feedback from a user who dismissed a previous feedback request that was also discarded" do
            sign_in @member.user
            feedback_request = create(:post_feedback_request, :dismissed, post: @post, member: @other_member)
            feedback_request.discard

            post organization_post_feedback_requests_path(@organization.slug, @post.public_id),
              params: { member_id: @other_member.public_id }

            assert_response :created
            assert_response_gen_schema

            assert_equal 1, @post.kept_feedback_requests.size
            assert_equal @post.kept_feedback_requests.first.public_id, json_response["id"]
            assert_equal 3, @post.kept_feedback_requests.first.events.size
          end

          test "returns a 403 for non-post author" do
            sign_in @other_member.user
            post organization_post_feedback_requests_path(@organization.slug, @post.public_id),
              params: { member_id: @member.public_id }
            assert_response :forbidden
          end

          test "cannot create multiple requests" do
            sign_in @member.user

            post organization_post_feedback_requests_path(@organization.slug, @post.public_id),
              params: { member_id: @other_member.public_id }

            assert_response :created
            assert_response_gen_schema

            assert_equal 1, @post.kept_feedback_requests.size

            post organization_post_feedback_requests_path(@organization.slug, @post.public_id),
              params: { member_id: @other_member.public_id }

            assert_response :created
            assert_equal 1, @post.kept_feedback_requests.size
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @member.user
            post organization_post_feedback_requests_path(@organization.slug, post.public_id),
              params: { member_id: @other_member.public_id }

            assert_response :not_found
          end
        end

        context "#destroy" do
          setup do
            @feedback = create(:post_feedback_request, post: @post)
          end

          test "works for post creator" do
            sign_in @member.user
            delete organization_post_feedback_request_path(@organization.slug, @post.public_id, @feedback.public_id)
            assert_response :no_content
            assert_predicate PostFeedbackRequest.find_by(id: @feedback.id), :discarded?
          end

          test "returns a 403 for non-post author" do
            sign_in @other_member.user
            delete organization_post_feedback_request_path(@organization.slug, @post.public_id, @feedback.public_id)
            assert_response :forbidden
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @member.user
            delete organization_post_feedback_request_path(@organization.slug, post.public_id, @feedback.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
