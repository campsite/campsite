# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class SharesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @admin = create(:organization_membership)
          @org = @admin.organization
          @member = create(:organization_membership, :member, organization: @org)
          integration = create(:integration, :slack, owner: @org)
          @slack_channel = create(:integration_channel, integration: integration)
        end

        context "#create" do
          test "it errors if member_id belongs to another organization" do
            post = create(:post, organization: @org)
            other_org_member = create(:organization_membership, organization: create(:organization))

            sign_in @member.user
            post organization_post_shares_path(@org.slug, post.public_id), params: {
              member_ids: [other_org_member.public_id],
            }

            assert_response :unprocessable_entity
            assert_equal "#{other_org_member.public_id} is not a valid member ID", json_response["message"]
          end

          test "it shares a post to a Slack channel" do
            post = create(:post, organization: @org)

            sign_in @member.user
            post organization_post_shares_path(@org.slug, post.public_id), params: {
              slack_channel_id: @slack_channel.provider_channel_id,
            }

            assert_response :no_content
            assert_enqueued_sidekiq_job SharePostToSlackJob, args: [post.id, @member.user.id, @slack_channel.provider_channel_id]
          end

          test "it errors if Slack channel doesn't belong to organization" do
            post = create(:post, organization: @org)
            other_org_slack_channel = create(:integration_channel)

            sign_in @member.user
            post organization_post_shares_path(@org.slug, post.public_id), params: {
              slack_channel_id: other_org_slack_channel.provider_channel_id,
            }

            assert_response :unprocessable_entity
            assert_equal "Slack channel does not belong to organization", json_response["message"]
          end

          test "it errors if Slack channel" do
            post = create(:post, organization: @org)

            sign_in @member.user
            post organization_post_shares_path(@org.slug, post.public_id)

            assert_response :unprocessable_entity
            assert_equal "Must provide at least one person or Slack channel", json_response["message"]
          end

          test "it errors for non-organization member" do
            post = create(:post, organization: @org)
            member_1 = create(:organization_membership, organization: @org)
            member_2 = create(:organization_membership, organization: @org)

            sign_in create(:user)
            post organization_post_shares_path(@org.slug, post.public_id), params: {
              member_ids: [member_1.public_id, member_2.public_id],
            }

            assert_response :forbidden
          end

          test "it errors for logged-out user" do
            post = create(:post, organization: @org)
            member_1 = create(:organization_membership, organization: @org)
            member_2 = create(:organization_membership, organization: @org)

            post organization_post_shares_path(@org.slug, post.public_id), params: {
              member_ids: [member_1.public_id, member_2.public_id],
            }

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
