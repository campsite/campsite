# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notes
      class ProjectPermissionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        context "#update" do
          setup do
            @note = create(:note)
            @member = @note.member
            @organization = @member.organization
            @project = create(:project, organization: @organization)
          end

          test "author creates project permissions" do
            assert_nil @note.project

            sign_in @member.user
            put organization_note_project_permissions_path(@organization.slug, @note.public_id),
              params: { project_id: @project.public_id, permission: :view },
              as: :json

            assert_response :ok
            assert_response_gen_schema
            assert_equal @project.public_id, json_response.dig("project", "id")
            assert_equal @project, @note.reload.project
            assert @note.project_view?
          end

          test "author updates project permission" do
            @note.add_to_project!(project: @project, permission: :view)

            new_project = create(:project, organization: @organization)

            sign_in @member.user
            put organization_note_project_permissions_path(@organization.slug, @note.public_id),
              params: { project_id: new_project.public_id, permission: :edit },
              as: :json

            assert_response :ok
            assert_response_gen_schema
            assert_equal new_project.public_id, json_response.dig("project", "id")
            assert_equal new_project, @note.reload.project
            assert @note.project_edit?
          end

          test "viewer permission cannot update project permission" do
            viewer_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: viewer_member.user, subject: @note, action: :view)

            sign_in viewer_member.user
            put organization_note_project_permissions_path(@organization.slug, @note.public_id),
              params: { project_id: @project.public_id, permission: :view },
              as: :json

            assert_response :forbidden
          end

          test "editor permission can update project permission" do
            editor_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: editor_member.user, subject: @note, action: :edit)

            sign_in editor_member.user
            put organization_note_project_permissions_path(@organization.slug, @note.public_id),
              params: { project_id: @project.public_id, permission: :view },
              as: :json

            assert_response :ok
            assert_response_gen_schema
          end

          test "project viewer cannot update project permission" do
            project_viewer_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user
            put organization_note_project_permissions_path(@organization.slug, @note.public_id),
              params: { project_id: @project.public_id, permission: :view },
              as: :json

            assert_response :forbidden
          end

          test "project editor can update project permission" do
            project_editor_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user
            put organization_note_project_permissions_path(@organization.slug, @note.public_id),
              params: { project_id: @project.public_id, permission: :view },
              as: :json

            assert_response :ok
            assert_response_gen_schema
          end

          test "member not part of private project cannot update project permissions" do
            private_project = create(:project, :private, organization: @organization)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @organization).user
            put organization_note_project_permissions_path(@organization.slug, @note.public_id),
              params: { project_id: @project.public_id, permission: :view },
              as: :json

            assert_response :forbidden
          end

          test "does not work for random user" do
            sign_in create(:user)
            put organization_note_project_permissions_path(@organization.slug, @note.public_id),
              params: { project_id: @project.public_id, permission: :view },
              as: :json

            assert_response :forbidden
          end

          test "does not work without auth" do
            put organization_note_project_permissions_path(@organization.slug, @note.public_id),
              params: { project_id: @project.public_id, permission: :view },
              as: :json

            assert_response :unauthorized
          end

          test "does not work for invalid project id" do
            sign_in @member.user
            put organization_note_project_permissions_path(@organization.slug, @note.public_id),
              params: { project_id: "0x123", permission: :view },
              as: :json

            assert_response :not_found
          end
        end

        context "#destroy" do
          setup do
            @note = create(:note)
            @member = @note.member
            @organization = @member.organization
            @project = create(:project, organization: @organization)

            @note.add_to_project!(project: @project, permission: :view)
          end

          test "author can delete project permission" do
            sign_in @member.user
            delete organization_note_project_permissions_path(@organization.slug, @note.public_id)

            assert_response :no_content
            assert_not @note.reload.project
            assert @note.project_none?
          end

          test "viewer permission cannot delete project permission" do
            viewer_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: viewer_member.user, subject: @note, action: :view)

            sign_in viewer_member.user
            delete organization_note_project_permissions_path(@organization.slug, @note.public_id)

            assert_response :forbidden
          end

          test "editor permission can delete project permission" do
            editor_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: editor_member.user, subject: @note, action: :edit)

            sign_in editor_member.user
            delete organization_note_project_permissions_path(@organization.slug, @note.public_id)

            assert_response :no_content
            assert_not @note.reload.project
            assert_equal "none", @note.project_permission
          end

          test "project viewer cannot delete project permission" do
            project_viewer_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user
            delete organization_note_project_permissions_path(@organization.slug, @note.public_id)

            assert_response :forbidden
          end

          test "project editor can update project permission" do
            project_editor_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user
            delete organization_note_project_permissions_path(@organization.slug, @note.public_id)

            assert_response :no_content
            assert_not @note.reload.project
            assert_equal "none", @note.project_permission
          end

          test "member not part of private project cannot update project permissions" do
            private_project = create(:project, :private, organization: @organization)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @organization).user
            delete organization_note_project_permissions_path(@organization.slug, @note.public_id)

            assert_response :forbidden
          end

          test "does not work for random user" do
            sign_in create(:user)
            delete organization_note_project_permissions_path(@organization.slug, @note.public_id)

            assert_response :forbidden
          end

          test "does not work without auth" do
            delete organization_note_project_permissions_path(@organization.slug, @note.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
