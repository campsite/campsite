# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      module Polls
        class VotesControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @user_membership = create(:organization_membership)
            @user = @user_membership.user
            @organization = @user.organizations.first
            @post_membership = create(:organization_membership, organization: @organization)
            @post = create(:post, organization: @organization, member: @post_membership)
          end

          context "#create" do
            setup do
              @poll = create(:poll, :with_options, post: @post)
              @option = @poll.options.first
            end

            test "works for post creator" do
              sign_in @post_membership.user

              assert_difference -> { @post.poll.votes.count } do
                post organization_post_poll2_option_vote_path(@organization.slug, @post.public_id, @option.public_id)

                assert_response :created
                assert_response_gen_schema
                assert_equal true, json_response["poll"]["viewer_voted"]
                assert_equal 1, json_response["poll"]["votes_count"]
                assert_includes @post.poll.votes.map(&:organization_membership_id), @post_membership.id
              end
            end

            test "works for an org admin" do
              sign_in @user

              assert_difference -> { @post.poll.votes.count } do
                post organization_post_poll2_option_vote_path(@organization.slug, @post.public_id, @option.public_id)

                assert_response :created
                assert_response_gen_schema
                assert_equal true, json_response["poll"]["viewer_voted"]
                assert_equal 1, json_response["poll"]["votes_count"]
                assert_includes @post.poll.votes.map(&:organization_membership_id), @user_membership.id
              end
            end

            test "works for other org members" do
              other_member = create(:organization_membership, organization: @organization)

              sign_in other_member.user
              assert_difference -> { @post.poll.votes.count } do
                post organization_post_poll2_option_vote_path(@organization.slug, @post.public_id, @option.public_id)

                assert_response :created
                assert_response_gen_schema
                assert_equal true, json_response["poll"]["viewer_voted"]
                assert_equal 1, json_response["poll"]["votes_count"]
                assert_includes @post.poll.votes.map(&:organization_membership_id), other_member.id
              end
            end

            test "returns 403 for a random user" do
              sign_in create(:user)

              post organization_post_poll2_option_vote_path(@organization.slug, @post.public_id, @option.public_id)

              assert_response :forbidden
            end

            test "return 401 for an unauthenticated user" do
              post organization_post_poll2_option_vote_path(@organization.slug, @post.public_id, @option.public_id)

              assert_response :unauthorized
            end

            test "returns 404 for draft post" do
              post = create(:post, :draft, organization: @organization)
              create(:poll, post: post)

              sign_in @user

              post organization_post_poll2_option_vote_path(@organization.slug, post.public_id, @option.public_id)

              assert_response :not_found
            end
          end
        end
      end
    end
  end
end
