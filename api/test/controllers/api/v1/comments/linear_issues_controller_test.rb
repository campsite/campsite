# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Comments
      class LinearIssuesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @comment = create(:comment)
          @member = @comment.author
          @organization = @member.organization

          create(:integration, :linear, owner: @organization)

          @params = {
            title: "Test",
            description: "Test",
            team_id: "123",
          }
        end

        describe "#create" do
          it "returns pending response for issue" do
            sign_in @member.user

            post organization_comment_linear_issues_path(@organization.slug, @comment.public_id), params: @params

            assert_response :ok
            assert_response_gen_schema

            assert_equal "pending", response.parsed_body["status"]
            assert_enqueued_sidekiq_job(CreateLinearIssueJob, args: [@params.to_json, "Comment", @comment.public_id, @member.id])
          end

          it "returns 403 if the post does not belong to the current organization" do
            sign_in @member.user

            post organization_comment_linear_issues_path(@organization.slug, create(:comment).public_id), params: @params

            assert_response :forbidden
          end

          it "returns 403 if the organization does not have a linear integration" do
            comment = create(:comment)

            sign_in comment.author.user

            post organization_comment_linear_issues_path(comment.organization.slug, comment.public_id), params: @params

            assert_response :forbidden
          end

          test "returns 403 for a guest" do
            guest_member = create(:organization_membership, :guest, organization: @organization)
            @comment.subject.project.add_member!(guest_member)

            sign_in guest_member.user
            post organization_comment_linear_issues_path(@organization.slug, @comment.public_id), params: @params

            assert_response :forbidden
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            post organization_comment_linear_issues_path(@organization.slug, @comment.public_id), params: @params
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_comment_linear_issues_path(@organization.slug, @comment.public_id), params: @params
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
