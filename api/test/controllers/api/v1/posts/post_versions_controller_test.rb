# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class PostVersionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user_member = create(:organization_membership)
          @user = @user_member.user
          @organization = @user.organizations.first
          @post = create(:post, organization: @organization, member: @user_member)
          @post_child = create(:post, organization: @organization, parent: @post)
          @post_grandchild = create(:post, organization: @organization, parent: @post_child)
        end

        context "#index" do
          test "works for org admin" do
            sign_in @user
            get organization_post_versions_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            expected_ids = [@post.public_id, @post_child.public_id, @post_grandchild.public_id]
            assert_equal expected_ids, json_response.pluck("id")
          end

          test "works for org member" do
            other_member = create(:organization_membership, :member, organization: @organization)

            sign_in other_member.user
            get organization_post_versions_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            expected_ids = [@post.public_id, @post_child.public_id, @post_grandchild.public_id]
            assert_equal expected_ids, json_response.pluck("id")
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            get organization_post_versions_path(@organization.slug, @post.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_post_versions_path(@organization.slug, @post.public_id)
            assert_response :unauthorized
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @user
            get organization_post_versions_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end

        context "#create" do
          test "copies all properties from the parent post" do
            post = create(
              :post,
              :with_attachments,
              :with_links,
              :with_poll,
              :feedback_requested,
              organization: @organization,
              tags: [
                create(:tag, organization: @organization),
                create(:tag, organization: @organization),
              ],
            )
            create(:post_feedback_request, post: post)
            create(:post_feedback_request, post: post)

            sign_in post.member.user
            post organization_post_versions_path(@organization.slug, post.public_id)

            assert_response :created
            assert_response_gen_schema

            assert_equal 2, json_response["version"]
            assert_equal post.title, json_response["title"]
            assert_equal post.description_html, json_response["description_html"]
            assert_equal post.status, json_response["status"]
            assert_equal post.tags.pluck(:public_id), json_response["tags"].pluck("id")
            assert_equal post.poll.description, json_response["poll"]["description"]
            assert_equal post.poll.options.count, json_response["poll"]["options"].count
            assert_equal 0, json_response["attachments"].count
            assert_equal post.links.count, json_response["links"].count
            assert_equal post.links[0].url, json_response["links"][0]["url"]
          end

          test "removes note comments" do
            post = create(
              :post,
              description_html: "<p><span class=\"note-comment\" commentId=\"yc29w27myr8m\">Foo</span> bar</p>",
              organization: @organization,
            )

            sign_in post.member.user
            post organization_post_versions_path(@organization.slug, post.public_id)

            assert_response :created
            assert_response_gen_schema

            assert_equal 2, json_response["version"]
            assert_equal post.title, json_response["title"]
            assert_equal "<p>Foo bar</p>", json_response["description_html"]
          end

          test "does not result in excessive queries" do
            post = create(
              :post,
              :with_attachments,
              :with_links,
              :with_poll,
              :feedback_requested,
              organization: @organization,
              tags: [
                create(:tag, organization: @organization),
                create(:tag, organization: @organization),
              ],
            )
            create(:post_feedback_request, post: post)
            create(:post_feedback_request, post: post)

            sign_in post.member.user

            assert_query_count 93 do
              post organization_post_versions_path(@organization.slug, post.public_id)
            end

            assert_response :created
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @user
            post organization_post_versions_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
