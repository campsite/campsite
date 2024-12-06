# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class GeneratedResolutionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @post = create(:post, description_html: "<p>What should I eat for breakfast?</p>")
          @member = @post.member
          @organization = @member.organization

          comment1 = create(:comment, subject: @post, body_html: "<p>I definitely think you should have pancakes.</p>")
          create(:comment, subject: @post, parent: comment1, body_html: "<p>I totally agree, pancakes sound delicious!</p>")

          # reload so comments are associated when we create the prompt
          @post.reload
        end

        context "#show" do
          test "returns pending response for post" do
            admin = create(:organization_membership, :admin, organization: @organization)
            sign_in admin.user

            assert_query_count 8 do
              get organization_post_generated_resolution_path(@organization.slug, @post.public_id)
            end

            assert_response :ok
            assert_response_gen_schema

            assert_not json_response["html"].present?
            assert_equal "pending", json_response["status"]
            assert_enqueued_sidekiq_job(GeneratePostResolutionJob, args: [@post.public_id, admin.id, nil])
          end

          test "returns saved response for post" do
            response = create(
              :llm_response,
              subject: @post,
              invocation_key: LlmResponse.create_invocation_key(@post.generate_resolution_prompt.to_json),
              response: "<p>Pancakes it is!</p>",
            )

            admin = create(:organization_membership, :admin, organization: @organization)
            sign_in admin.user
            get organization_post_generated_resolution_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal "<p>Pancakes it is!</p>", json_response["html"]
            assert_equal "success", json_response["status"]
            assert_equal response.public_id, json_response["response_id"]
            refute_enqueued_sidekiq_job(GeneratePostResolutionJob)
          end

          test "returns pending response for comment" do
            comment = create(:comment, subject: @post)

            admin = create(:organization_membership, :admin, organization: @organization)
            sign_in admin.user

            assert_query_count 9 do
              get organization_post_generated_resolution_path(@organization.slug, @post.public_id), params: { comment_id: comment.public_id }
            end

            assert_response :ok
            assert_response_gen_schema

            assert_not json_response["html"].present?
            assert_equal "pending", json_response["status"]
            assert_enqueued_sidekiq_job(GeneratePostResolutionJob, args: [@post.public_id, admin.id, comment.public_id])
          end

          test "returns saved response for comment" do
            comment = create(:comment, subject: @post)
            response = create(
              :llm_response,
              subject: @post,
              invocation_key: LlmResponse.create_invocation_key(@post.generate_resolution_prompt(comment).to_json),
              response: "<p>Pancakes it is!</p>",
            )

            admin = create(:organization_membership, :admin, organization: @organization)
            sign_in admin.user

            get organization_post_generated_resolution_path(@organization.slug, @post.public_id), params: { comment_id: comment.public_id }

            assert_response :ok
            assert_response_gen_schema

            assert_equal "<p>Pancakes it is!</p>", json_response["html"]
            assert_equal "success", json_response["status"]
            assert_equal response.public_id, json_response["response_id"]
            refute_enqueued_sidekiq_job(GeneratePostResolutionJob)
          end

          test "returns a response for a comment from an oauth application" do
            comment = create(:comment, :from_oauth_application, subject: @post)

            admin = create(:organization_membership, :admin, organization: @organization)
            sign_in admin.user

            get organization_post_generated_resolution_path(@organization.slug, @post.public_id), params: { comment_id: comment.public_id }

            assert_response :ok
            assert_response_gen_schema
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            admin = create(:organization_membership, :admin, organization: @organization)
            sign_in admin.user

            get organization_post_generated_resolution_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
