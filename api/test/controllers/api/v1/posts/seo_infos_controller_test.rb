# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class SeoInfosControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @admin_member = create(:organization_membership)
          @org = @admin_member.organization
          @post = create(:post, organization: @org)
        end

        context "#show" do
          test "works for org admin" do
            sign_in @admin_member.user
            get organization_post_seo_info_path(@org.slug, @post.public_id)

            assert_response :success
            assert_response_gen_schema
            assert_equal @post.title, json_response["seo_title"]
            assert_equal "#{@org.name} · #{@post.user.display_name}", json_response["seo_description"]
            assert_equal @post.note_open_graph_image_url, json_response["open_graph_image_url"]
            assert_nil json_response["open_graph_video_url"]
          end

          test "includes open graph image and video URLs" do
            video = create(:attachment, :video, subject: @post)

            sign_in @admin_member.user
            get organization_post_seo_info_path(@org.slug, @post.public_id)

            assert_response :success
            assert_response_gen_schema
            assert_equal @post.title, json_response["seo_title"]
            assert_equal "#{@org.name} · #{@post.user.display_name}", json_response["seo_description"]
            assert_equal video.preview_url, json_response["open_graph_image_url"]
            assert_equal video.url, json_response["open_graph_video_url"]
          end

          test "works for org member" do
            member = create(:organization_membership, :member, organization: @org)

            sign_in member.user
            get organization_post_seo_info_path(@org.slug, @post.public_id)

            assert_response :success
            assert_response_gen_schema
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            get organization_post_seo_info_path(@org.slug, @post.public_id)

            assert_response :forbidden
          end

          test "return 403 for an unauthenticated user" do
            get organization_post_seo_info_path(@org.slug, @post.public_id)

            assert_response :forbidden
          end

          test "works for an unauthenticated user when post is public" do
            @post.update!(visibility: :public)

            get organization_post_seo_info_path(@org.slug, @post.public_id)

            assert_response :success
            assert_response_gen_schema
          end

          test "doesn't result in excessive amount of queries" do
            sign_in @admin_member.user

            assert_query_count 4 do
              get organization_post_seo_info_path(@org.slug, @post.public_id)
            end

            assert_response :success
            assert_response_gen_schema
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @org)

            sign_in @admin_member.user
            get organization_post_seo_info_path(@org.slug, post.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
