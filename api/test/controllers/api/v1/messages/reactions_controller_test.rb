# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Messages
      class ReactionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @organization = @member.organization
          @thread = create(:message_thread, :dm, owner: @member)
          @message = create(:message, message_thread: @thread)
          @custom_reaction = create(:custom_reaction, organization: @organization)
        end

        context "#create" do
          test("it creates an initial reaction (content)") do
            sign_in @member.user

            assert_difference -> { Reaction.count }, 1 do
              post organization_message_reactions_path(@organization.slug, @message.public_id), params: { content: "👍" }, as: :json
            end

            assert_response :created
            assert_response_gen_schema
            assert_equal 1, @message.reload.reactions.count
            assert_equal "👍", json_response["content"]
          end

          test("it creates an initial reaction (custom_content)") do
            sign_in @member.user

            assert_difference -> { Reaction.count }, 1 do
              post organization_message_reactions_path(@organization.slug, @message.public_id), params: { custom_content_id: @custom_reaction.public_id }, as: :json
            end

            assert_response :created
            assert_response_gen_schema
            assert_equal 1, @message.reload.reactions.count
            assert_equal @custom_reaction.public_id, json_response["custom_content"]["id"]
          end

          test("it queues a pusher event") do
            sign_in @member.user

            post organization_message_reactions_path(@organization.slug, @message.public_id), params: { content: "👍" }, as: :json

            assert_enqueued_sidekiq_jobs(1, only: InvalidateMessageJob)
          end

          test("query count") do
            sign_in @member.user

            assert_query_count 15 do
              post organization_message_reactions_path(@organization.slug, @message.public_id), params: { content: "👍" }, as: :json
            end
          end

          test("return 403 if the user is not a member of the thread") do
            other_member = create(:organization_membership, organization: @organization)
            sign_in other_member.user

            post organization_message_reactions_path(@organization.slug, @message.public_id), params: { content: "👍" }, as: :json

            assert_response :forbidden
          end

          test("returns 422 for invalid params") do
            sign_in @member.user

            post organization_message_reactions_path(@organization.slug, @message.public_id)

            assert_response :unprocessable_entity
            assert_equal "Either content or custom_content must be present, both cannot be nil at the same time.", json_response["message"]
          end
        end
      end
    end
  end
end
