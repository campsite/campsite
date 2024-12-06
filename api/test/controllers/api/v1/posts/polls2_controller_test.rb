# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class Polls2ControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user_membership = create(:organization_membership)
          @user = @user_membership.user
          @organization = @user.organizations.first
          @post_membership = create(:organization_membership, organization: @organization)
          @post = create(:post, organization: @organization, member: @post_membership)
        end

        context "#create" do
          test "post creator creates a poll" do
            sign_in @post_membership.user

            post organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                description: "best sport",
                options: [
                  { description: "option a" },
                  { description: "option b" },
                ],
              }

            assert_response :created
            assert_response_gen_schema
            assert_equal "best sport", json_response["poll"]["description"]
            assert_equal 2, json_response["poll"]["options"].length
            assert_equal false, json_response["poll"]["viewer_voted"]
          end

          test "returns an error if no poll options" do
            sign_in @post_membership.user

            post organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                description: "best sport",
              }

            assert_response :unprocessable_entity
            assert_equal "Options attributes length must be between 2 and 4", json_response["message"]
          end

          test "returns an error if too many poll options" do
            sign_in @post_membership.user

            post organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                description: "best sport",
                options: [
                  { description: "option a" },
                  { description: "option b" },
                  { description: "option c" },
                  { description: "option d" },
                  { description: "option e" },
                ],
              }

            assert_response :unprocessable_entity
            assert_equal "Options attributes length must be between 2 and 4", json_response["message"]
          end

          test "returns an error if post already has a poll" do
            create(:poll, post: @post)

            sign_in @post_membership.user

            post organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                description: "best sport",
                options: [
                  { description: "option a" },
                  { description: "option b" },
                ],
              }

            assert_response :unprocessable_entity
            assert_equal "Post has already been taken", json_response["message"]
          end

          test "org admin creates a poll" do
            sign_in @user

            post organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                description: "best sport",
                options: [
                  { description: "option a" },
                  { description: "option b" },
                ],
              }

            assert_response :created
            assert_response_gen_schema
            assert_equal "best sport", json_response["poll"]["description"]
            assert_equal 2, json_response["poll"]["options"].length
            assert_equal false, json_response["poll"]["viewer_voted"]
          end

          test "returns 403 for another org member" do
            other_member = create(:organization_membership, :member, organization: @organization)
            sign_in other_member.user

            post organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                description: "best sport",
                options: [
                  { description: "option a" },
                  { description: "option b" },
                ],
              }

            assert_response :forbidden
          end

          test "returns 403 for a random user" do
            sign_in create(:user)

            post organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                description: "best sport",
                options: [
                  { description: "option a" },
                  { description: "option b" },
                ],
              }

            assert_response :forbidden
          end

          test "returns 401 for an unauthenticated user" do
            post organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                description: "best sport",
                options: [
                  { description: "option a" },
                  { description: "option b" },
                ],
              }

            assert_response :unauthorized
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @post_membership.user
            post organization_post_poll2_path(@organization.slug, post.public_id),
              params: {
                description: "best sport",
                options: [
                  { description: "option a" },
                  { description: "option b" },
                ],
              }

            assert_response :not_found
          end
        end

        context "#update" do
          setup do
            @poll = create(:poll, description: "best sport", post: @post)
            @option_a = create(:poll_option, poll: @poll, description: "option a")
            @option_b = create(:poll_option, poll: @poll, description: "option b")
          end

          test "post creator updates a poll" do
            sign_in @post_membership.user

            put organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                options: [
                  { id: @option_a.public_id, description: "new option a" },
                  { description: "option c" },
                ],
              }

            assert_response :ok
            assert_response_gen_schema
            assert_equal "best sport", json_response["poll"]["description"]
            assert_equal 2, json_response["poll"]["options"].length
            assert_equal @option_a.public_id, json_response["poll"]["options"][0]["id"]
            assert_equal "new option a", json_response["poll"]["options"][0]["description"]
            assert_equal "new option a", @option_a.reload.description
            assert_equal "option c", json_response["poll"]["options"][1]["description"]
          end

          test "returns an error if no poll options" do
            sign_in @post_membership.user

            put organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                options: [],
              }

            assert_response :unprocessable_entity
            assert_equal "Options length must be between 2 and 4", json_response["message"]
            assert_equal 2, @poll.reload.options.length
          end

          test "returns an error if too many poll options" do
            sign_in @post_membership.user

            put organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                options: [
                  { description: "option a" },
                  { description: "option b" },
                  { description: "option c" },
                  { description: "option d" },
                  { description: "option e" },
                ],
              }

            assert_response :unprocessable_entity
            assert_equal "Options length must be between 2 and 4", json_response["message"]
          end

          test "returns an error if poll option description is too long" do
            sign_in @post_membership.user

            put organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                options: [
                  { id: @option_a.public_id, description: "a" * 100 },
                  { description: "option c" },
                ],
              }

            assert_response :unprocessable_entity
            assert_equal "option a", @option_a.reload.description
            assert_equal "option b", @option_b.reload.description
          end

          test "org admin updates a poll" do
            sign_in @user

            put organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                options: [
                  { id: @option_a.public_id, description: "new option a" },
                  { description: "option c" },
                ],
              }

            assert_response :ok
            assert_response_gen_schema
            assert_equal "best sport", json_response["poll"]["description"]
            assert_equal 2, json_response["poll"]["options"].length
            assert_equal @option_a.public_id, json_response["poll"]["options"][0]["id"]
            assert_equal "new option a", json_response["poll"]["options"][0]["description"]
            assert_equal "option c", json_response["poll"]["options"][1]["description"]
          end

          test "returns 403 for another org member" do
            other_member = create(:organization_membership, :member, organization: @organization)
            sign_in other_member.user

            put organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                options: [
                  { id: @option_a.public_id, description: "new option a" },
                  { description: "option c" },
                ],
              }

            assert_response :forbidden
          end

          test "returns 403 for a random user" do
            sign_in create(:user)

            put organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                options: [
                  { id: @option_a.public_id, description: "new option a" },
                  { description: "option c" },
                ],
              }

            assert_response :forbidden
          end

          test "returns 401 for an unauthenticated user" do
            put organization_post_poll2_path(@organization.slug, @post.public_id),
              params: {
                options: [
                  { id: @option_a.public_id, description: "new option a" },
                  { description: "option c" },
                ],
              }

            assert_response :unauthorized
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @post_membership.user
            put organization_post_poll2_path(@organization.slug, post.public_id),
              params: {
                options: [
                  { id: @option_a.public_id, description: "new option a" },
                  { description: "option c" },
                ],
              }

            assert_response :not_found
          end
        end

        context "#destroy" do
          setup do
            @poll = create(:poll, post: @post)
          end

          test "post creator deletes a poll" do
            sign_in @post_membership.user

            delete organization_post_poll2_path(@organization.slug, @post.public_id)

            assert_response :no_content
            assert_predicate Poll.find_by(id: @poll.id), :nil?
          end

          test "org admin deletes a poll" do
            sign_in @user

            delete organization_post_poll2_path(@organization.slug, @post.public_id)

            assert_response :no_content
            assert_predicate Poll.find_by(id: @poll.id), :nil?
          end

          test "returns 403 for another org member" do
            other_member = create(:organization_membership, :member, organization: @organization)
            sign_in other_member.user

            delete organization_post_poll2_path(@organization.slug, @post.public_id)

            assert_response :forbidden
          end

          test "returns 403 for a random user" do
            sign_in create(:user)

            delete organization_post_poll2_path(@organization.slug, @post.public_id)

            assert_response :forbidden
          end

          test "returns 401 for an unauthenticated user" do
            delete organization_post_poll2_path(@organization.slug, @post.public_id)

            assert_response :unauthorized
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @post_membership.user
            delete organization_post_poll2_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
