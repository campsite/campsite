# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Favorites
      class FavoritesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @org_member = create(:organization_membership, organization: @organization)
          @user = @org_member.user

          @favorites = create_list(:favorite, 4, organization_membership: @org_member)
          @projects = @favorites.map(&:favoritable)
        end

        context "#update" do
          test "works for an org admin" do
            sign_in @user

            put reorder_organization_favorites_path(@organization.slug, favorites: [
              { id: @favorites[3].public_id, position: 0 },
              { id: @favorites[0].public_id, position: 1 },
              { id: @favorites[2].public_id, position: 2 },
              { id: @favorites[1].public_id, position: 3 },
            ])

            assert_response :no_content
            assert_equal [@favorites[3], @favorites[0], @favorites[2], @favorites[1]], @org_member.reload.member_favorites
          end

          test "returns 404 if passed unrecognized ID" do
            sign_in @user

            put reorder_organization_favorites_path(@organization.slug, favorites: [
              { id: @favorites[3].public_id, position: 0 },
              { id: @favorites[0].public_id, position: 1 },
              { id: @favorites[2].public_id, position: 2 },
              { id: "temp-foobar", position: 3 },
            ])

            assert_response :not_found
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            put reorder_organization_favorites_path(@organization.slug, favorites: [])
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            put reorder_organization_favorites_path(@organization.slug, favorites: [])
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
