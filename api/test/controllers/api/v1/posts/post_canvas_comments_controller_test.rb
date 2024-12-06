# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class PostCanvasCommentsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user_member = create(:organization_membership)
          @user = @user_member.user
          @organization = @user.organizations.first
          @post = create(:post, organization: @organization, member: @user_member)
        end

        context "#index" do
          setup do
            create(:comment, subject: @post, x: 123, y: 456)
            create(:comment, subject: @post)
          end

          test "works for org admin" do
            sign_in @user
            get organization_post_canvas_comments_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 1, json_response.length
          end

          test "works for org member" do
            member = create(:organization_membership, :member, organization: @organization).user

            sign_in member
            get organization_post_canvas_comments_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 1, json_response.length
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            get organization_post_canvas_comments_path(@organization.slug, @post.public_id)
            assert_response :forbidden
          end

          test "works for a random user on a public post" do
            @post.update!(visibility: :public)

            sign_in create(:user)
            get organization_post_canvas_comments_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "return 403 for an unauthenticated user" do
            get organization_post_canvas_comments_path(@organization.slug, @post.public_id)
            assert_response :forbidden
          end

          test "works for an unauthenticated user on a public post" do
            @post.update!(visibility: :public)

            get organization_post_canvas_comments_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "returns comment replies" do
            sign_in @user
            first_comment = @post.comments.first
            create(:comment, subject: @post, parent_id: first_comment.id)
            get organization_post_canvas_comments_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 1, json_response.length
            assert_equal 1, json_response.first["replies"].length
          end

          test "doesn't result in excessive amount of queries" do
            create_list(:comment, 2, subject: @post, x: 123, y: 456)

            sign_in @user

            assert_query_count 6 do
              get organization_post_canvas_comments_path(@organization.slug, @post.public_id)
            end
          end

          test "returns 404 for a bogus organization slug" do
            sign_in @user

            get organization_post_canvas_comments_path("not-an-org-slug", @post.public_id)

            assert_response :not_found
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @user
            get organization_post_canvas_comments_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
