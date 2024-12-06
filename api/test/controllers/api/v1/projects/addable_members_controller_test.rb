# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Projects
      class AddableMembersControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @organization = create(:organization)
          @project = create(:project, organization: @organization)
          project_membership = create(:project_membership, project: @project)
          @existing_member = project_membership.organization_membership
          @addable_member = create(:organization_membership, organization: @organization)
        end

        context "#index" do
          test "org member can see members who can be added to project" do
            sign_in @existing_member.user

            assert_query_count 8 do
              get organization_project_addable_members_path(@organization.slug, @project.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal [@addable_member.public_id], json_response.dig("data").pluck("id")
          end

          test "does not work for a private project you don't have access to" do
            project = create(:project, private: true, organization: @organization)

            sign_in @existing_member.user
            get organization_project_addable_members_path(@organization.slug, project.public_id)

            assert_response :forbidden
          end

          test "guest can't list addable members" do
            guest_member = create(:organization_membership, :guest, organization: @organization)
            @project.add_member!(guest_member)

            sign_in guest_member.user
            get organization_project_addable_members_path(@organization.slug, @project.public_id)

            assert_response :forbidden
          end

          test "return 403 for a random user" do
            sign_in create(:user)
            get organization_project_addable_members_path(@organization.slug, @project.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_project_addable_members_path(@organization.slug, @project.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
