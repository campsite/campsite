# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class FavoritesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
          @user = @member.user
          @post = create(:post, organization: @organization)
        end

        context "#create" do
          test "works for an org member" do
            sign_in @user
            post organization_post_favorite_path(@organization.slug, @post.public_id)

            assert_response :created
            assert_response_gen_schema
            assert_equal Post.to_s, json_response["favoritable_type"]
            assert_equal @post.public_id, json_response["favoritable_id"]
            assert_equal @post.title, json_response["name"]
            assert_equal @post.url, json_response["url"]
          end

          test "does not work for a post you don't have access to" do
            @post.update!(project: create(:project, :private, organization: @organization))

            sign_in @user
            post organization_post_favorite_path(@organization.slug, @post.public_id)

            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_post_favorite_path(@organization.slug, @post.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_post_favorite_path(@organization.slug, @post.public_id)

            assert_response :unauthorized
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @user
            post organization_post_favorite_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end

        context "#destroy" do
          test "works for an org member" do
            @post.favorites.create!(organization_membership: @member)

            sign_in @user
            delete organization_post_favorite_path(@organization.slug, @post.public_id)

            assert_response :no_content
            assert_equal 0, @post.favorites.count
          end

          test "does not work for a post you don't have access to" do
            @post.favorites.create!(organization_membership: @member)
            @post.update!(project: create(:project, :private, organization: @organization))

            sign_in @user
            delete organization_post_favorite_path(@organization.slug, @post.public_id)

            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            delete organization_post_favorite_path(@organization.slug, @post.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            delete organization_post_favorite_path(@organization.slug, @post.public_id)

            assert_response :unauthorized
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @user
            delete organization_post_favorite_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
