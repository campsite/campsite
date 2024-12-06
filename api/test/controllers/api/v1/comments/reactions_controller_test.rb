# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Comments
      class ReactionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @comment = create(:comment)
          @organization = @comment.member.organization
          @member = create(:organization_membership, organization: @organization)
          @custom_reaction = create(:custom_reaction, organization: @organization)
        end

        context "#create" do
          test "works for post creator (content)" do
            sign_in @comment.member.user
            post organization_comment_reactions_path(@organization.slug, @comment.public_id),
              params: { content: "🔥" },
              as: :json

            assert_response :created
            assert_response_gen_schema
            assert_equal 1, @comment.reactions.size
            assert_equal "🔥", json_response["content"]
          end

          test "works for post creator (custom_content)" do
            sign_in @comment.member.user
            post organization_comment_reactions_path(@organization.slug, @comment.public_id), params: { custom_content_id: @custom_reaction.public_id }

            assert_response :created
            assert_response_gen_schema
            assert_equal 1, @comment.reactions.size
            assert_equal @custom_reaction.public_id, json_response["custom_content"]["id"]
          end

          test "triggers reactions-stale with pusher" do
            sign_in @comment.member.user

            post organization_comment_reactions_path(@organization.slug, @comment.public_id),
              params: { content: "🔥" },
              as: :json

            assert_response :created
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@comment.subject.channel_name, "reactions-stale", { post_id: @comment.subject.public_id, subject_type: "Comment", user_id: @comment.member.user.public_id }.to_json])
          end

          test "you can only have one reaction per subject, post and type (content)" do
            sign_in @comment.member.user

            post organization_comment_reactions_path(@organization.slug, @comment.public_id),
              params: { content: "🔥" },
              as: :json

            assert_response :created
            assert_equal 1, @comment.reactions.size
            assert_equal "🔥", json_response["content"]

            post organization_comment_reactions_path(@organization.slug, @comment.public_id),
              params: { content: "🔥" },
              as: :json

            assert_response :unprocessable_entity

            @second_comment = create(:comment, subject: @comment.subject)
            post organization_comment_reactions_path(@organization.slug, @second_comment.public_id),
              params: { content: "🔥" },
              as: :json

            assert_response :created
          end

          test "query count" do
            sign_in @comment.member.user

            assert_query_count 16 do
              post organization_comment_reactions_path(@organization.slug, @comment.public_id),
                params: { content: "🔥" },
                as: :json
            end
          end

          test "works for an org admin" do
            sign_in create(:organization_membership, :admin, organization: @organization).user

            post organization_comment_reactions_path(@organization.slug, @comment.public_id),
              params: { content: "🔥" },
              as: :json

            assert_response :created
            assert_equal 1, @comment.reactions.size
            assert_equal "🔥", json_response["content"]
          end

          test "works for other org members" do
            other_member = create(:organization_membership, organization: @organization)

            sign_in other_member.user
            post organization_comment_reactions_path(@organization.slug, @comment.public_id),
              params: { content: "🔥" },
              as: :json

            assert_response :created
            assert_equal 1, @comment.reactions.size
            assert_equal "🔥", json_response["content"]
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            post organization_comment_reactions_path(@organization.slug, @comment.public_id),
              params: { content: "🔥" },
              as: :json
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_comment_reactions_path(@organization.slug, @comment.public_id),
              params: { content: "🔥" },
              as: :json
            assert_response :unauthorized
          end

          test "returns 422 for invalid params" do
            sign_in @member.user
            post organization_comment_reactions_path(@organization.slug, @comment.public_id)

            assert_response :unprocessable_entity
            assert_equal "Either content or custom_content must be present, both cannot be nil at the same time.", json_response["message"]
          end
        end
      end
    end
  end
end
