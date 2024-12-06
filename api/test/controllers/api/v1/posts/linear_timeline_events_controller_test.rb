# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Posts
      class LinearTimelineEventsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @post = create(:post)
          @comment = create(:comment, subject: @post)
          @member = @post.member
          @user = @member.user
          @organization = @member.organization
        end

        context "#index" do
          setup do
            @post.timeline_events.create!(actor: @member, action: :subject_pinned)
            @post.timeline_events.create!(actor: @member, action: :post_resolved)
            @post.timeline_events.create!(actor: @member, action: :created_linear_issue_from_post)
            @comment.timeline_events.create!(actor: @member, action: :created_linear_issue_from_comment)
          end

          test "works for org admin" do
            sign_in @user
            get organization_post_linear_timeline_events_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
          end

          test "works for org member" do
            other_member = create(:organization_membership, :member, organization: @organization)

            sign_in other_member.user
            get organization_post_linear_timeline_events_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "returns external record references" do
            external_record = create(:external_record, :linear_issue)

            @post.timeline_events.create!(actor: @member, action: :post_referenced_in_external_record, reference: external_record)

            sign_in @user
            get organization_post_linear_timeline_events_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["data"].length
          end

          test "doesn't return external record references from other subjects" do
            external_record = create(:external_record, :linear_issue)
            new_post = create(:post)

            new_post.timeline_events.create!(actor: @member, action: :post_referenced_in_external_record, reference: external_record)

            sign_in @user
            get organization_post_linear_timeline_events_path(@organization.slug, @post.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
          end

          test "query count" do
            sign_in @user

            assert_query_count 8 do
              get organization_post_linear_timeline_events_path(@organization.slug, @post.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            get organization_post_linear_timeline_events_path(@organization.slug, @post.public_id)
            assert_response :forbidden
          end

          test "returns 403 for a random user on a public post" do
            @post.update!(visibility: :public)

            sign_in create(:user)
            get organization_post_linear_timeline_events_path(@organization.slug, @post.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_post_linear_timeline_events_path(@organization.slug, @post.public_id)
            assert_response :unauthorized
          end

          test "returns 401 for an unauthenticated user on a public post" do
            @post.update!(visibility: :public)

            get organization_post_linear_timeline_events_path(@organization.slug, @post.public_id)

            assert_response :unauthorized
          end

          test "returns 404 for draft post" do
            post = create(:post, :draft, organization: @organization)

            sign_in @user
            get organization_post_linear_timeline_events_path(@organization.slug, post.public_id)

            assert_response :not_found
          end
        end
      end
    end
  end
end
