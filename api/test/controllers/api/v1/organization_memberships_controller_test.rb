# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class OrganizationMembershipsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @user = create(:user)
      end

      context "#index" do
        before do
          @memberships = create_list(:organization_membership, 4, user: @user)
        end

        test "returns orgs for a user" do
          sign_in @user
          get organization_memberships_path

          assert_response :ok
          assert_response_gen_schema

          expected_ids = @user.organization_memberships.pluck(:public_id).sort
          assert_equal expected_ids, json_response.pluck("id").sort
        end

        test "returns orgs in order by position" do
          @memberships[0].set_list_position(1)
          @memberships[1].set_list_position(0)
          @memberships[2].set_list_position(3)
          @memberships[3].set_list_position(2)

          sign_in @user
          get organization_memberships_path

          assert_response :ok
          assert_response_gen_schema

          expected_ids = [@memberships[1], @memberships[0], @memberships[3], @memberships[2]].map(&:public_id)
          assert_equal expected_ids, json_response.pluck("id")
        end

        test "return 401 for an unauthenticated user" do
          get organization_memberships_path
          assert_response :unauthorized
        end

        test "returns viewers role" do
          create(:organization_membership, :member, user: @user)
          create(:organization_membership, :viewer, user: @user)

          sign_in @user
          get organization_memberships_path

          assert_response :ok
          assert_response_gen_schema

          assert_equal [true, true, true, true, false, false], json_response.map { |m| m.dig("organization", "viewer_is_admin") }
        end

        test("query count") do
          sign_in @user

          assert_query_count 2 do
            get organization_memberships_path
          end
        end
      end
    end
  end
end
