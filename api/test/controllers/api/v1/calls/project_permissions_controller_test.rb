# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Calls
      class ProjectPermissionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @call = create(:call)
          @member = create(:call_peer, call: @call).organization_membership
          @organization = @member.organization
          @project = create(:project, organization: @organization)
        end

        context "#update" do
          test "call participant creates project permissions" do
            assert_nil @call.project

            sign_in @member.user
            put organization_call_project_permission_path(@organization.slug, @call.public_id),
              params: { project_id: @project.public_id, permission: :view },
              as: :json

            assert_response :ok
            assert_response_gen_schema
            assert_equal @project.public_id, json_response.dig("project", "id")
            assert_equal @project, @call.reload.project
            assert @call.project_view?
          end

          test "call participant updates project permissions" do
            @call.add_to_project!(project: @project, permission: :view)

            new_project = create(:project, organization: @organization)

            sign_in @member.user
            put organization_call_project_permission_path(@organization.slug, @call.public_id),
              params: { project_id: new_project.public_id, permission: :edit },
              as: :json

            assert_response :ok
            assert_response_gen_schema
            assert_equal new_project.public_id, json_response.dig("project", "id")
            assert_equal new_project, @call.reload.project
            assert @call.project_edit?
          end

          test "non-participant cannot update project permission" do
            other_member = create(:organization_membership, :member, organization: @organization)

            sign_in other_member.user
            put organization_call_project_permission_path(@organization.slug, @call.public_id),
              params: { project_id: @project.public_id, permission: :view },
              as: :json

            assert_response :forbidden
          end

          test "does not work for random user" do
            sign_in create(:user)
            put organization_call_project_permission_path(@organization.slug, @call.public_id),
              params: { project_id: @project.public_id, permission: :view },
              as: :json

            assert_response :forbidden
          end

          test "does not work for logged-out user" do
            put organization_call_project_permission_path(@organization.slug, @call.public_id),
              params: { project_id: @project.public_id, permission: :view },
              as: :json

            assert_response :unauthorized
          end

          test "does not work for invalid project id" do
            sign_in @member.user
            put organization_call_project_permission_path(@organization.slug, @call.public_id),
              params: { project_id: "0x123", permission: :view },
              as: :json

            assert_response :not_found
          end
        end

        context "#destroy" do
          setup do
            @call.add_to_project!(project: @project, permission: :view)
          end

          test "call participant can delete project permission" do
            sign_in @member.user
            delete organization_call_project_permission_path(@organization.slug, @call.public_id)

            assert_response :no_content
            assert_nil @call.reload.project
            assert @call.project_none?
          end

          test "non-participant cannot delete project permission" do
            other_member = create(:organization_membership, :member, organization: @organization)

            sign_in other_member.user
            delete organization_call_project_permission_path(@organization.slug, @call.public_id)

            assert_response :forbidden
          end

          test "does not work for random user" do
            sign_in create(:user)
            delete organization_call_project_permission_path(@organization.slug, @call.public_id)

            assert_response :forbidden
          end

          test "does not work for logged-out user" do
            delete organization_call_project_permission_path(@organization.slug, @call.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
