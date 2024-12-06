# frozen_string_literal: true

require "test_helper"

require "test_helpers/rack_attack_helper"

module Api
  module V1
    module Projects
      class MembersControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @project = create(:project, organization: @organization)
          project_membership = create(:project_membership, project: @project)
          @member = project_membership.organization_membership
          @user = project_membership.user
        end

        context "#index" do
          test "org member can see project members" do
            sign_in @user

            assert_query_count 7 do
              get organization_project_members_path(@organization.slug, @project.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_includes json_response.dig("data").pluck("id"), @member.public_id
          end

          test "does not work for a private project you don't have access to" do
            project = create(:project, private: true, organization: @organization)

            sign_in @user
            get organization_project_members_path(@organization.slug, project.public_id)

            assert_response :forbidden
          end

          test "returns member matching ID" do
            other_member = create(:project_membership, project: @project).organization_membership

            sign_in @user
            get organization_project_members_path(@organization.slug, @project.public_id, params: { organization_membership_id: other_member.public_id })

            assert_response :ok
            assert_response_gen_schema
            assert_not_includes json_response.dig("data").pluck("id"), @member.public_id
            assert_includes json_response.dig("data").pluck("id"), other_member.public_id
          end

          test "includes only specified roles" do
            guest_member = create(:organization_membership, :guest, organization: @organization)
            @project.add_member!(guest_member)

            sign_in @user
            get organization_project_members_path(@organization.slug, @project.public_id, params: { roles: [Role::GUEST_NAME] })

            assert_response :ok
            assert_response_gen_schema
            assert_not_includes json_response.dig("data").pluck("id"), @member.public_id
            assert_includes json_response.dig("data").pluck("id"), guest_member.public_id
          end

          test "excludes specified roles" do
            guest_member = create(:organization_membership, :guest, organization: @organization)
            @project.add_member!(guest_member)

            sign_in @user
            get organization_project_members_path(@organization.slug, @project.public_id, params: { exclude_roles: [Role::GUEST_NAME] })

            assert_response :ok
            assert_response_gen_schema
            assert_includes json_response.dig("data").pluck("id"), @member.public_id
            assert_not_includes json_response.dig("data").pluck("id"), guest_member.public_id
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            get organization_project_members_path(@organization.slug, @project.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_project_members_path(@organization.slug, @project.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
