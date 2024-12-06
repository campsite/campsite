# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class VotersControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @poll_vote = create(:poll_vote)
          @voter_member = @poll_vote.member
          @poll_option = @poll_vote.poll_option
          poll = @poll_option.poll
          @post = poll.post
          @organization = @post.organization
        end

        context "#index" do
          test "works for post creator" do
            sign_in @voter_member.user

            assert_query_count 7 do
              get organization_post_poll_option_voters_path(@organization.slug, @post.public_id, @poll_option.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal [@voter_member.public_id], json_response["data"].pluck("id")
          end

          test "works for an org admin" do
            admin_member = create(:organization_membership, organization: @organization)
            sign_in admin_member.user

            get organization_post_poll_option_voters_path(@organization.slug, @post.public_id, @poll_option.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal [@voter_member.public_id], json_response["data"].pluck("id")
          end

          test "works for other org members" do
            other_member = create(:organization_membership, :member, organization: @organization)
            sign_in other_member.user

            get organization_post_poll_option_voters_path(@organization.slug, @post.public_id, @poll_option.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal [@voter_member.public_id], json_response["data"].pluck("id")
          end

          test "returns 403 for a random user" do
            sign_in create(:user)

            get organization_post_poll_option_voters_path(@organization.slug, @post.public_id, @poll_option.public_id)

            assert_response :forbidden
          end

          test "return 403 for an unauthenticated user" do
            get organization_post_poll_option_voters_path(@organization.slug, @post.public_id, @poll_option.public_id)

            assert_response :forbidden
          end

          test "works for unauthenticated user on public post" do
            @post.update!(visibility: "public")

            get organization_post_poll_option_voters_path(@organization.slug, @post.public_id, @poll_option.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal [@voter_member.public_id], json_response["data"].pluck("id")
          end

          test "does not work for invalid poll options" do
            sign_in @voter_member.user

            get organization_post_poll_option_voters_path(@organization.slug, @post.public_id, "0x123")

            assert_response :unprocessable_entity
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @voter_member.user
            get organization_post_poll_option_voters_path(@organization.slug, post.public_id, @poll_option.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
