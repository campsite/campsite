# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class ResolutionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @post = create(:post)
          @member = @post.member
          @organization = @member.organization
        end

        context "#create" do
          test "works for an org admin" do
            Timecop.freeze do
              previous_last_activity_at = @post.last_activity_at
              admin = create(:organization_membership, :admin, organization: @organization)
              sign_in admin.user

              post organization_post_resolution_path(@organization.slug, @post.public_id)

              assert_response :created
              assert_response_gen_schema
              assert json_response["resolution"]["resolved_at"].present?
              assert_equal admin.public_id, json_response["resolution"]["resolved_by"]["id"]
              assert_predicate @post.reload, :resolved?
              assert_in_delta @post.last_activity_at, previous_last_activity_at
              assert_equal admin, @post.resolved_by
              assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@post.channel_name, "invalidate-post", { post_id: @post.public_id }.to_json])
            end
          end

          test "works for org member" do
            member = create(:organization_membership, :member, organization: @organization)
            sign_in member.user

            post organization_post_resolution_path(@organization.slug, @post.public_id)

            assert_response :created
            assert_response_gen_schema
            assert json_response["resolution"]["resolved_at"].present?
            assert_equal member.public_id, json_response["resolution"]["resolved_by"]["id"]
            assert_predicate @post.reload, :resolved?
            assert_equal member, @post.resolved_by
          end

          test "query count" do
            admin = create(:organization_membership, :admin, organization: @organization)
            sign_in admin.user

            assert_query_count 20 do
              post organization_post_resolution_path(@organization.slug, @post.public_id)
            end
          end

          test "resolves from a comment" do
            comment = create(:comment, subject: @post)
            admin = create(:organization_membership, :admin, organization: @organization)
            sign_in admin.user

            post organization_post_resolution_path(@organization.slug, @post.public_id),
              params: { comment_id: comment.public_id },
              as: :json

            assert_response :created
            assert_response_gen_schema
            assert json_response["resolution"]["resolved_at"].present?
            assert_equal admin.public_id, json_response["resolution"]["resolved_by"]["id"]
            assert_equal comment.public_id, json_response["resolution"]["resolved_comment"]["id"]
            assert_predicate @post.reload, :resolved?
            assert_equal admin, @post.resolved_by
            assert_equal comment, @post.resolved_comment
          end

          test "returns 404 when resolving from a comment on another post" do
            comment = create(:comment)
            admin = create(:organization_membership, :admin, organization: @organization)
            sign_in admin.user

            post organization_post_resolution_path(@organization.slug, @post.public_id),
              params: { comment_id: comment.public_id },
              as: :json

            assert_response :not_found
          end

          test "works for an org viewer" do
            viewer = create(:organization_membership, :viewer, organization: @organization)
            sign_in viewer.user
            post organization_post_resolution_path(@organization.slug, @post.public_id)

            assert_response :created
            assert_response_gen_schema
            assert json_response["resolution"]["resolved_at"].present?
            assert_equal viewer.public_id, json_response["resolution"]["resolved_by"]["id"]
            assert_predicate @post.reload, :resolved?
            assert_equal viewer, @post.resolved_by
          end

          test "a guest can resolve a post in a project they belong to" do
            guest_member = create(:organization_membership, :guest, organization: @organization)
            @post.project.add_member!(guest_member)

            sign_in guest_member.user
            post organization_post_resolution_path(@organization.slug, @post.public_id)

            assert_response :created
            assert_response_gen_schema
            assert json_response["resolution"]["resolved_at"].present?
            assert_equal guest_member.public_id, json_response["resolution"]["resolved_by"]["id"]
            assert_predicate @post.reload, :resolved?
            assert_equal guest_member, @post.resolved_by
          end

          test "a guest cannnot resolve a post in a project they don't belong to" do
            guest_member = create(:organization_membership, :guest, organization: @organization)

            sign_in guest_member.user
            post organization_post_resolution_path(@organization.slug, @post.public_id)

            assert_response :forbidden
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            post organization_post_resolution_path(@organization.slug, @post.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_post_resolution_path(@organization.slug, @post.public_id)
            assert_response :unauthorized
          end

          test "event actor matches resolver" do
            member = create(:organization_membership, organization: @organization)
            sign_in member.user

            post organization_post_resolution_path(@organization.slug, @post.public_id)

            assert_not_nil @post.reload.resolved_by
            assert_equal @post.resolved_by, @post.events.last.actor
            assert_equal @post.resolved_by, member
            assert_not_equal @post.member, @post.events.last.actor
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            member = create(:organization_membership, :member, organization: @organization)
            sign_in member.user

            post organization_post_resolution_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end

        context "#destroy" do
          setup do
            @post.resolve!(actor: @member, html: "<p>resolved</p>", comment_id: nil)
          end

          test "works for comment creator" do
            sign_in @member.user

            delete organization_post_resolution_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_not json_response["resolved_at"].present?
            assert_not json_response["resolved_by"]
            assert_not_predicate @post.reload, :resolved?
            assert_nil @post.resolved_by
            assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@post.channel_name, "invalidate-post", { post_id: @post.public_id }.to_json])
          end

          test "works for other member" do
            member = create(:organization_membership, :member, organization: @organization)

            sign_in member.user

            delete organization_post_resolution_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_not json_response["resolved_at"].present?
            assert_not json_response["resolved_by"]
            assert_not_predicate @post.reload, :resolved?
            assert_nil @post.resolved_by
          end

          test "returns 403 for a random user" do
            sign_in create(:user)

            delete organization_post_resolution_path(@organization.slug, @post.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            delete organization_post_resolution_path(@organization.slug, @post.public_id)

            assert_response :unauthorized
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            member = create(:organization_membership, :member, organization: @organization)
            sign_in member.user

            delete organization_post_resolution_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
