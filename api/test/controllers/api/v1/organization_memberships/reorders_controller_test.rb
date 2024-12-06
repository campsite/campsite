# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module OrganizationMemberships
      class ReordersControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @user = create(:user)
          @memberships = create_list(:organization_membership, 4, user: @user)
        end

        context "#update" do
          test "reorders memberships" do
            sign_in @user

            new_order = [@memberships[3], @memberships[0], @memberships[2], @memberships[1]]

            put reorder_organization_memberships_path(membership_ids: new_order.map(&:public_id))

            assert_response :no_content
            assert_equal new_order.map(&:id), @user.reload.organization_memberships.order(:position).map(&:id)
          end

          test "returns 404 if passed unrecognized ID" do
            sign_in @user

            put reorder_organization_memberships_path(membership_ids: [
              @memberships[3].public_id,
              @memberships[0].public_id,
              @memberships[2].public_id,
              "temp-foobar",
            ])

            assert_response :not_found
          end

          test "return 401 for an unauthenticated user" do
            put reorder_organization_memberships_path(membership_ids: [])
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
