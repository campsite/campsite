# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class PublicationsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @draft_post = create(:post, :draft)
          @author_member = @draft_post.member
          @organization = @draft_post.organization
        end

        describe "#create" do
          test "author can publish post" do
            draft_post = nil

            Timecop.freeze do
              draft_post = create(:post, :draft, last_activity_at: 10.minutes.ago)

              author_member = draft_post.member
              organization = draft_post.organization

              sign_in author_member.user
              post organization_post_publication_path(organization.slug, draft_post.public_id)

              assert_response :created
              assert_response_gen_schema
              assert_equal true, json_response["published"]
              assert_in_delta Time.current, draft_post.reload.published_at, 2.seconds
              assert_in_delta Time.current, draft_post.last_activity_at, 2.seconds
            end
          end

          test "post author can't publish post twice" do
            @draft_post.publish!

            sign_in @author_member.user
            post organization_post_publication_path(@organization.slug, @draft_post.public_id)

            assert_response :unprocessable_entity
            assert_equal "There is no event publish defined for the published state", json_response["message"]
          end

          test "non-author can't publish post" do
            other_member = create(:organization_membership, organization: @organization)

            sign_in other_member.user
            post organization_post_publication_path(@organization.slug, @draft_post.public_id)

            assert_response :forbidden
          end

          test "random user can't publish post" do
            sign_in create(:user)
            post organization_post_publication_path(@organization.slug, @draft_post.public_id)

            assert_response :forbidden
          end

          test "unathorized user can't publish post" do
            post organization_post_publication_path(@organization.slug, @draft_post.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
