# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class ActivityViewsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @organization = create(:organization)
        @member = create(:organization_membership, organization: @organization)
      end

      context "#create" do
        test "sets the activity_last_seen_at" do
          sign_in @member.user
          last_seen_at = Time.current

          Timecop.freeze(5.minutes.ago) do
            open_project = create(:project, organization: @organization)
            post = create(:post, member: @member, organization: @organization, created_at: 5.minutes.ago, project: open_project)
            reaction = create(:reaction, subject: post, member: create(:organization_membership, organization: @organization))
            reaction.events.created_action.first!.process!
          end

          assert_equal 1, @member.user.unread_activity_counts_by_org_slug_async.value[@organization.slug]

          post organization_activity_views_path(@organization.slug), params: { last_seen_at: last_seen_at.iso8601 }, as: :json

          assert_response :ok
          assert_response_gen_schema

          @member.reload
          assert_in_delta last_seen_at, @member.activity_last_seen_at, 1.second
          assert_nil @member.home_last_seen_at
          assert_nil json_response["activity"][@organization.slug]
        end

        test "returns 401 for an unauthenticated user" do
          last_seen_at = Time.current

          post organization_activity_views_path(@organization.slug), params: { last_seen_at: last_seen_at.iso8601 }, as: :json

          assert_response :unauthorized
        end

        test "returns 403 for a user who is not a member of the organization" do
          non_member = create(:user)
          sign_in non_member
          last_seen_at = Time.current

          post organization_activity_views_path(@organization.slug), params: { last_seen_at: last_seen_at.iso8601 }, as: :json

          assert_response :forbidden
        end

        test "returns 422 when last_seen_at parameter is missing" do
          sign_in @member.user

          post organization_activity_views_path(@organization.slug)

          assert_response :unprocessable_entity
        end
      end
    end
  end
end
