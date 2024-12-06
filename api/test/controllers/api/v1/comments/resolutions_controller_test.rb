# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Comments
      class ResolutionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @comment = create(:comment)
          @member = @comment.member
          @organization = @member.organization
        end

        context "#create" do
          test "works for an org admin" do
            admin = create(:organization_membership, :admin, organization: @organization)
            sign_in admin.user

            post organization_comment_resolutions_path(@organization.slug, @comment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert json_response["resolved_at"].present?
            assert_equal admin.public_id, json_response["resolved_by"]["id"]
            assert_predicate @comment.reload, :resolved?
            assert_equal admin, @comment.resolved_by
          end

          test "works for org member" do
            member = create(:organization_membership, :member, organization: @organization)

            sign_in member.user

            post organization_comment_resolutions_path(@organization.slug, @comment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert json_response["resolved_at"].present?
            assert_equal member.public_id, json_response["resolved_by"]["id"]
            assert_predicate @comment.reload, :resolved?
            assert_equal member, @comment.resolved_by
          end

          test "works for an org admin" do
            admin = create(:organization_membership, :admin, organization: @organization)
            sign_in admin.user

            assert_query_count 17 do
              post organization_comment_resolutions_path(@organization.slug, @comment.public_id)
            end
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            post organization_comment_resolutions_path(@organization.slug, @comment.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_comment_resolutions_path(@organization.slug, @comment.public_id)
            assert_response :unauthorized
          end

          test "event actor matches resolver" do
            sign_in create(:organization_membership, organization: @organization).user

            post organization_comment_resolutions_path(@organization.slug, @comment.public_id)

            assert_not_nil @comment.reload.resolved_by
            assert_equal @comment.resolved_by, @comment.events.last.actor
            assert_not_equal @comment.member, @comment.events.last.actor
          end
        end

        context "#destroy" do
          setup do
            @comment.resolve!(actor: @member)
          end

          test "works for comment creator" do
            sign_in @member.user

            delete organization_comment_resolutions_path(@organization.slug, @comment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_not json_response["resolved_at"].present?
            assert_not json_response["resolved_by"]
            assert_not_predicate @comment.reload, :resolved?
            assert_nil @comment.resolved_by
          end

          test "works for other member" do
            member = create(:organization_membership, :member, organization: @organization)

            sign_in member.user

            delete organization_comment_resolutions_path(@organization.slug, @comment.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_not json_response["resolved_at"].present?
            assert_not json_response["resolved_by"]
            assert_not_predicate @comment.reload, :resolved?
            assert_nil @comment.resolved_by
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            delete organization_comment_resolutions_path(@organization.slug, @comment.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            delete organization_comment_resolutions_path(@organization.slug, @comment.public_id)
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
