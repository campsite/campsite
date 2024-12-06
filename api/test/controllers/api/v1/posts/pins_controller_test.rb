# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class PinsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @org = @member.organization
          @project = create(:project, organization: @org)
          @post = create(:post, project: @project, organization: @org)
        end

        context "#create" do
          test "creates a pin for a post" do
            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 1 do
              post organization_post_pin_path(@org.slug, @post.public_id)
            end

            assert_response :created
            assert_response_gen_schema

            pin = ProjectPin.last

            assert_equal @post.public_id, json_response["pin"]["post"]["id"]
            assert_nil json_response["pin"]["note"]
            assert_equal @member, pin.pinner
            assert_equal pin.public_id, json_response["pin"]["post"]["project_pin_id"]
            assert_equal pin.public_id, json_response["pin"]["id"]
          end

          test "updates discarded pin for a post" do
            pin = create(:project_pin, pinner: @member, subject: @post, discarded_at: 5.minutes.ago)

            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 0 do
              post organization_post_pin_path(@org.slug, @post.public_id)
            end

            assert_response :created
            assert_response_gen_schema

            assert_equal @post.public_id, json_response["pin"]["post"]["id"]
            assert_nil json_response["pin"]["note"]
            assert_equal @member, pin.pinner
            assert_equal pin.public_id, json_response["pin"]["post"]["project_pin_id"]
            assert_equal pin.public_id, json_response["pin"]["id"]

            assert_predicate pin.reload, :undiscarded?
          end

          test "returns 404 for unknown post" do
            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 0 do
              post organization_post_pin_path(@org.slug, "abcdefg")
            end

            assert_response :not_found
          end

          test "returns 403 when pinning to a private project without membership" do
            @project.update(private: true)

            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 0 do
              post organization_post_pin_path(@org.slug, @post.public_id)
            end

            assert_response :forbidden
          end

          test "creates a pin for a post in a private project" do
            @project.update(private: true)
            create(:project_membership, organization_membership: @member, project: @project)

            sign_in @member.user

            assert_difference -> { ProjectPin.count }, 1 do
              post organization_post_pin_path(@org.slug, @post.public_id)
            end

            assert_response :created
            assert_response_gen_schema

            assert_equal @post.public_id, json_response["pin"]["post"]["id"]
            assert_nil json_response["pin"]["note"]
            assert_equal @member, ProjectPin.last.pinner
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_post_pin_path(@org.slug, @post.public_id)
            assert_response :forbidden
          end

          test "returns 401 for unauthorized user" do
            post organization_post_pin_path(@org.slug, @post.public_id)
            assert_response :unauthorized
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @org)

            sign_in @member.user
            post organization_post_pin_path(@org.slug, post.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
