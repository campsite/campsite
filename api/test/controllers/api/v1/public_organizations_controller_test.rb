# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class PublicOrganizationsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @user = create(:organization_membership).user
        @organization = @user.organizations.first
      end

      context "#show_by_token" do
        test "returns the organization for an admin" do
          assert @organization.admin?(@user)

          sign_in @user
          get public_organization_path(@organization.invite_token)

          assert_response :ok
          assert_equal @organization.name, json_response["name"]
          assert_equal @organization.slug, json_response["slug"]
          assert_equal @organization.public_id, json_response["id"]
          assert_response_gen_schema
        end

        test "return 401 for an unauthenticated user" do
          get public_organization_path(@organization.invite_token)
          assert_response :unauthorized
        end

        test "return 404 for an org invite_code that doesn't exist" do
          sign_in @user
          get public_organization_path("doesntexist")
          assert_response :not_found
        end
      end
    end
  end
end
