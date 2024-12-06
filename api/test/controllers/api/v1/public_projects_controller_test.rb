# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    class PublicProjectsControllerTest < ActionDispatch::IntegrationTest
      include Devise::Test::IntegrationHelpers

      setup do
        @user = create(:user)
        @project = create(:project)
      end

      context "#show" do
        test "returns the project" do
          sign_in @user
          get public_project_path(@project.invite_token)

          assert_response :ok
          assert_response_gen_schema
          assert_equal @project.name, json_response["name"]
          assert_equal @project.public_id, json_response["id"]
          assert_equal @project.organization.name, json_response.dig("organization", "name")
          assert_equal @project.organization.slug, json_response.dig("organization", "slug")
          assert_equal @project.organization.public_id, json_response.dig("organization", "id")
        end

        test "return 401 for an unauthenticated user" do
          get public_project_path(@project.invite_token)
          assert_response :unauthorized
        end

        test "return 404 for a token that doesn't exist" do
          sign_in @user
          get public_project_path("doesntexist")
          assert_response :not_found
        end
      end
    end
  end
end
