# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class ReactionsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      context "#destroy" do
        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
        end

        test "returns a 404 for other org members" do
          reaction = create(:reaction, member: @member)
          other_member = create(:organization_membership, organization: @organization)
          sign_in other_member.user

          delete organization_reactions_path(@organization.slug), params: { id: reaction.public_id }, as: :json

          assert_response :not_found
        end

        test "return 401 for an unauthenticated user" do
          reaction = create(:reaction, member: @member)

          delete organization_reactions_path(@organization.slug), params: { id: reaction.public_id }, as: :json

          assert_response :unauthorized
        end

        context "#thread" do
          before do
            @thread = create(:message_thread, :dm, owner: @member)
            @message = create(:message, message_thread: @thread)
            @message_reaction = create(:reaction, subject: @message, member: @member)
          end

          test "works for thread reaction creator" do
            sign_in @member.user

            assert_query_count 12 do
              delete organization_reactions_path(@organization.slug), params: { id: @message_reaction.public_id }, as: :json
            end

            assert_response :no_content
            assert_predicate @message_reaction.reload, :discarded?
            assert_enqueued_sidekiq_jobs(1, only: InvalidateMessageJob)
          end
        end

        context "#post" do
          setup do
            @user = create(:organization_membership).user
            @post = create(:post, organization: @organization, member: @member)
            @post_reaction = create(:reaction, subject: @post, member: @member)
          end

          context "#destroy" do
            test "works for post reaction creator" do
              sign_in @member.user

              assert_query_count 12 do
                delete organization_reactions_path(@organization.slug), params: { id: @post_reaction.public_id }, as: :json
              end

              assert_response :no_content
              assert_predicate @post_reaction.reload, :discarded?
              assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@post.channel_name, "reactions-stale", { post_id: @post.public_id, subject_type: "Post", user_id: @member.user.public_id }.to_json])
            end
          end
        end

        context "#comment" do
          setup do
            @comment = create(:comment)
            @comment_reaction = @comment.reactions.create(content: "🔥", member: @member)
          end

          test "works for comment reaction creator" do
            sign_in @member.user

            assert_query_count 13 do
              delete organization_reactions_path(@organization.slug), params: { id: @comment_reaction.public_id }, as: :json
            end

            assert_response :no_content
            assert_predicate @comment_reaction.reload, :discarded?
          end
        end
      end
    end
  end
end
