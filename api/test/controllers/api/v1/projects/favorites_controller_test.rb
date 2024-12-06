# frozen_string_literal: true

require "test_helper"

require "test_helpers/rack_attack_helper"

module Api
  module V1
    module Projects
      class FavoritesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        include RackAttackHelper

        setup do
          @organization = create(:organization)
          @member = create(:organization_membership, organization: @organization)
          @user = @member.user
          @project = create(:project, organization: @organization)
        end

        context "#create" do
          test "works for an org admin" do
            sign_in @user

            post organization_project_favorites_path(@organization.slug, @project.public_id)

            assert_response :created
            assert_response_gen_schema
            assert_equal Project.to_s, json_response["favoritable_type"]
            assert_equal @project.public_id, json_response["favoritable_id"]
            assert_equal @project.name, json_response["name"]
            assert_equal @project.url, json_response["url"]
          end

          test "does not work for a private project you don't have access to" do
            @project = create(:project, organization: @organization, private: true)
            sign_in @user

            post organization_project_favorites_path(@organization.slug, @project.public_id)

            assert_response :forbidden
            assert_equal 0, @project.favorites.count
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            post organization_project_favorites_path(@organization.slug, @project.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            post organization_project_favorites_path(@organization.slug, @project.public_id)
            assert_response :unauthorized
          end
        end

        context "#destroy" do
          test "works for an org admin" do
            @project.favorites.create!(organization_membership: @member)
            sign_in @user

            delete organization_project_favorites_path(@organization.slug, @project.public_id)

            assert_response :no_content

            assert_equal 0, @project.favorites.count
          end

          test "works for a private project you are a member of" do
            @project = create(:project, organization: @organization, private: true)
            @project.favorites.create!(organization_membership: @member)
            create(:project_membership, organization_membership: @member, project: @project)
            sign_in @user

            delete organization_project_favorites_path(@organization.slug, @project.public_id)

            assert_response :no_content
            assert_equal 0, @project.favorites.count
          end

          test "does not work for a private project you aren't a member of" do
            @project = create(:project, organization: @organization, private: true)
            @project.favorites.create!(organization_membership: @member)
            sign_in @user

            delete organization_project_favorites_path(@organization.slug, @project.public_id)

            assert_response :forbidden
            assert_equal 1, @project.favorites.count
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            delete organization_project_favorites_path(@organization.slug, @project.public_id)
            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            delete organization_project_favorites_path(@organization.slug, @project.public_id)
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
