# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class PostLinksControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
          @user = @member.user
          @project = create(:project, organization: @organization)
          @post = create(:post, organization: @organization, project: @project)
        end

        context "#create" do
          test "create a postlink for an org admin" do
            sign_in @user

            assert_difference -> { PostLink.count } do
              post organization_post_links_path(@organization.slug, @post.public_id),
                params: {
                  name: "Example",
                  url: "https://example.com",
                }

              assert_response_gen_schema
              assert_equal "Example", json_response["name"]
              assert_equal "https://example.com", json_response["url"]
            end
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @user
            post organization_post_links_path(@organization.slug, post.public_id),
              params: {
                name: "Example",
                url: "https://example.com",
              }

            assert_response :not_found
          end
        end
      end
    end
  end
end
