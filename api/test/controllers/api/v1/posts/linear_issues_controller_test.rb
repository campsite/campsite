# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class LinearIssuesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @user = @member.user
          @organization = @user.organizations.first
          @post = create(:post, organization: @organization)

          create(:integration, :linear, owner: @organization)

          @params = {
            title: "Test",
            description: "Test",
            team_id: "123",
          }
        end

        describe "#create" do
          it "returns pending response for issue" do
            sign_in @user

            post organization_post_linear_issues_path(@organization.slug, @post.public_id), params: @params

            assert_response :ok
            assert_response_gen_schema

            assert_equal "pending", response.parsed_body["status"]
            assert_enqueued_sidekiq_job(CreateLinearIssueJob, args: [@params.to_json, "Post", @post.public_id, @member.id])
          end

          it "returns 404 if the post does not belong to the current organization" do
            sign_in @user

            post organization_post_linear_issues_path(@organization.slug, create(:post).public_id), params: @params

            assert_response :not_found
          end

          it "returns 403 if the organization does not have a linear integration" do
            post = create(:post)

            sign_in post.author.user

            post organization_post_linear_issues_path(post.organization.slug, post.public_id), params: @params

            assert_response :forbidden
          end

          test "returns 403 for a guest" do
            guest_member = create(:organization_membership, :guest, organization: @organization)
            @post.project.add_member!(guest_member)

            sign_in guest_member.user
            post organization_post_linear_issues_path(@organization.slug, @post.public_id), params: @params

            assert_response :forbidden
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            post organization_post_linear_issues_path(@organization.slug, @post.public_id), params: @params
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_post_linear_issues_path(@organization.slug, @post.public_id), params: @params
            assert_response :unauthorized
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @user
            post organization_post_linear_issues_path(@organization.slug, post.public_id), params: @params

            assert_response :not_found
          end
        end
      end
    end
  end
end
