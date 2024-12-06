# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module MessageThreads
      class DmsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @dm = create(:message_thread, :dm)
          @member = @dm.organization_memberships.first
          @organization = @member.organization
          @other_member = @dm.organization_memberships.last
        end

        context "#show" do
          test "returns a DM by username" do
            sign_in @member.user

            assert_query_count 10 do
              get organization_dm_path(@organization.slug, @other_member.user.username)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal @dm.public_id, json_response["dm"]["id"]
          end

          test "returns nil if no existing DM" do
            other_member = create(:organization_membership)
            create(:message_thread, :group, organization_memberships: [@member, other_member])

            sign_in @member.user
            get organization_dm_path(@organization.slug, other_member.user.username)

            assert_response :ok
            assert_response_gen_schema
            assert_nil json_response["dm"]
          end

          test "returns forbidden for a non-org member" do
            sign_in create(:user)
            get organization_dm_path(@organization.slug, @other_member.user.username)

            assert_response :forbidden
          end

          test "returns unauthorized for a logged-out user" do
            get organization_dm_path(@organization.slug, @other_member.user.username)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
