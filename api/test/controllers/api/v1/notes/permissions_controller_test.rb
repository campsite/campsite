# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notes
      class PermissionsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @note = create(:note)
          @member = @note.member
          @org = @member.organization
          @project = create(:project, organization: @org)
        end

        context "#index" do
          before do
            @other_members = create_list(:organization_membership, 3, organization: @org)
            @other_members.each do |member|
              create(:permission, subject: @note, user: member.user, action: :view)
            end
          end

          test "author can view all permissions" do
            sign_in @member.user
            get organization_note_permissions_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response.size
            assert_equal @other_members[2].user.public_id, json_response[2]["user"]["id"]
            assert_equal @other_members[1].user.public_id, json_response[1]["user"]["id"]
            assert_equal @other_members[0].user.public_id, json_response[0]["user"]["id"]
          end

          test "viewer permission can view all permissions" do
            sign_in @other_members[0].user
            get organization_note_permissions_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response.size
          end

          test "members not part of the organization cannot view permissions" do
            sign_in create(:organization_membership, organization: @org).user
            get organization_note_permissions_path(@org.slug, @note.public_id)

            assert_response :forbidden
          end

          test "project viewer can view all permissions" do
            project_viewer_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user
            get organization_note_permissions_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response.size
          end

          test "project editor can view all permissions" do
            project_editor_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user
            get organization_note_permissions_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response.size
          end

          test "member not part of private project cannot view all permissions" do
            private_project = create(:project, :private, organization: @org)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @org).user
            get organization_note_permissions_path(@org.slug, @note.public_id)

            assert_response :forbidden
          end

          test "random user cannot view permissions" do
            sign_in create(:organization_membership).user
            get organization_note_permissions_path(@org.slug, @note.public_id)

            assert_response :forbidden
          end

          test "unauthenticated user cannot view permissions" do
            get organization_note_permissions_path(@org.slug, @note.public_id)

            assert_response :unauthorized
          end

          test "query count" do
            sign_in @member.user
            assert_query_count 5 do
              get organization_note_permissions_path(@org.slug, @note.public_id)
            end
          end
        end

        context "#create" do
          before do
            @add_member = create(:organization_membership, organization: @org)
          end

          test "author can create permission" do
            sign_in @member.user

            assert_difference -> { @note.permissions.count }, 1 do
              post organization_note_permissions_path(@org.slug, @note.public_id),
                params: { member_ids: [@add_member.public_id], permission: :edit },
                as: :json
            end

            assert_response :created
            assert_response_gen_schema

            permission = Permission.last
            assert_equal "edit", permission.action
            assert_equal "edit", json_response[0]["action"]
            assert_equal permission.public_id, json_response[0]["id"]
          end

          test "author can restore discarded permission" do
            permission = create(:permission, subject: @note, user: @add_member.user, action: :view)
            permission.discard!

            sign_in @member.user

            assert_difference -> { @note.permissions.count }, 0 do
              post organization_note_permissions_path(@org.slug, @note.public_id),
                params: { member_ids: [@add_member.public_id], permission: :edit },
                as: :json
            end

            assert_response :created
            assert_response_gen_schema

            permission = Permission.last
            assert_equal permission.public_id, json_response[0]["id"]
            assert_not permission.discarded?
          end

          test "can add multiple permissions at once" do
            another_member = create(:organization_membership, organization: @org)

            sign_in @member.user

            assert_difference -> { @note.permissions.count }, 2 do
              post organization_note_permissions_path(@org.slug, @note.public_id),
                params: { member_ids: [@add_member.public_id, another_member.public_id], permission: :view },
                as: :json
            end

            assert_response :created
            assert_response_gen_schema

            assert_equal 2, json_response.size
          end

          test "rejects unknown members" do
            sign_in @member.user

            assert_difference -> { @note.permissions.count }, 1 do
              post organization_note_permissions_path(@org.slug, @note.public_id),
                params: { member_ids: [@add_member.public_id, "foobar"], permission: :view },
                as: :json
            end

            assert_response :created
            assert_response_gen_schema

            assert_equal 1, json_response.size
          end

          test "viewer permission cannot create permission" do
            other_member = create(:organization_membership, organization: @org)
            create(:permission, subject: @note, user: other_member.user, action: :view)
            sign_in other_member.user

            assert_difference -> { @note.permissions.count }, 0 do
              post organization_note_permissions_path(@org.slug, @note.public_id),
                params: { member_ids: [@add_member.public_id], permission: :edit },
                as: :json
            end

            assert_response :forbidden
          end

          test "editor permission can create permission" do
            other_member = create(:organization_membership, organization: @org)
            create(:permission, subject: @note, user: other_member.user, action: :edit)
            sign_in other_member.user

            assert_difference -> { @note.permissions.count }, 1 do
              post organization_note_permissions_path(@org.slug, @note.public_id),
                params: { member_ids: [@add_member.public_id], permission: :edit },
                as: :json
            end

            permission = Permission.last
            assert_equal "edit", permission.action
            assert_equal "edit", json_response[0]["action"]
            assert_equal permission.public_id, json_response[0]["id"]
          end

          test "member not part of the organization cannot create permissions" do
            sign_in create(:organization_membership, organization: @org).user

            assert_difference -> { @note.permissions.count }, 0 do
              post organization_note_permissions_path(@org.slug, @note.public_id),
                params: { member_ids: [@add_member.public_id], permission: :edit },
                as: :json
            end

            assert_response :forbidden
          end

          test "project viewer cannot create permissions" do
            project_viewer_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user

            assert_difference -> { @note.permissions.count }, 0 do
              post organization_note_permissions_path(@org.slug, @note.public_id),
                params: { member_ids: [@add_member.public_id], permission: :edit },
                as: :json
            end

            assert_response :forbidden
          end

          test "project editor can create permissions" do
            project_editor_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user

            assert_difference -> { @note.permissions.count }, 1 do
              post organization_note_permissions_path(@org.slug, @note.public_id),
                params: { member_ids: [@add_member.public_id], permission: :edit },
                as: :json
            end

            permission = Permission.last
            assert_equal "edit", permission.action
            assert_equal "edit", json_response[0]["action"]
            assert_equal permission.public_id, json_response[0]["id"]
          end

          test "member not part of private project cannot create permissions" do
            private_project = create(:project, :private, organization: @org)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @org).user

            assert_difference -> { @note.permissions.count }, 0 do
              post organization_note_permissions_path(@org.slug, @note.public_id),
                params: { member_ids: [@add_member.public_id], permission: :edit },
                as: :json
            end

            assert_response :forbidden
          end

          test "random user cannot create permissions" do
            sign_in create(:organization_membership).user

            assert_difference -> { @note.permissions.count }, 0 do
              post organization_note_permissions_path(@org.slug, @note.public_id),
                params: { member_ids: [@add_member.public_id], permission: :edit },
                as: :json
            end

            assert_response :forbidden
          end

          test "unauthenticated user cannot create permissions" do
            assert_difference -> { @note.permissions.count }, 0 do
              post organization_note_permissions_path(@org.slug, @note.public_id),
                params: { member_ids: [@add_member.public_id], permission: :edit },
                as: :json
            end

            assert_response :unauthorized
          end

          test "query count" do
            sign_in @member.user

            assert_query_count 15 do
              post organization_note_permissions_path(@org.slug, @note.public_id),
                params: { member_ids: [@add_member.public_id], permission: :edit },
                as: :json
            end
          end
        end

        context "#update" do
          before do
            @other_member = create(:organization_membership, organization: @org)
            @permission = create(:permission, subject: @note, user: @other_member.user, action: :view)
          end

          test "author can update permission" do
            sign_in @member.user

            put organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id),
              params: { permission: :edit },
              as: :json

            assert_response :ok
            assert_response_gen_schema

            permission = Permission.last
            assert_equal "edit", permission.action
            assert_equal "edit", json_response["action"]
            assert_equal permission.public_id, json_response["id"]
          end

          test "viewer permission cannot update permission" do
            other_member = create(:organization_membership, organization: @org)
            create(:permission, subject: @note, user: other_member.user, action: :view)
            sign_in other_member.user

            put organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id),
              params: { permission: :edit },
              as: :json

            assert_response :forbidden
          end

          test "editor permision can update permission" do
            other_member = create(:organization_membership, organization: @org)
            create(:permission, subject: @note, user: other_member.user, action: :edit)
            sign_in other_member.user

            put organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id),
              params: { permission: :edit },
              as: :json

            assert_response :ok
            assert_response_gen_schema

            assert_equal "edit", @permission.reload.action
            assert_equal "edit", json_response["action"]
            assert_equal @permission.public_id, json_response["id"]
          end

          test "member not part of the organization cannot update permissions" do
            sign_in create(:organization_membership, organization: @org).user

            put organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id),
              params: { permission: :edit },
              as: :json

            assert_response :forbidden
          end

          test "project viewer cannot update permissions" do
            project_viewer_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user

            put organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id),
              params: { permission: :edit },
              as: :json

            assert_response :forbidden
          end

          test "project editor can update permissions" do
            project_editor_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user

            put organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id),
              params: { permission: :edit },
              as: :json

            assert_response :ok
            assert_response_gen_schema

            assert_equal "edit", @permission.reload.action
            assert_equal "edit", json_response["action"]
            assert_equal @permission.public_id, json_response["id"]
          end

          test "member not part of private project cannot update permissions" do
            private_project = create(:project, :private, organization: @org)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @org).user

            put organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id),
              params: { permission: :edit },
              as: :json

            assert_response :forbidden
          end

          test "random user cannot update permissions" do
            sign_in create(:user)

            put organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id),
              params: { permission: :edit },
              as: :json

            assert_response :forbidden
          end

          test "unauthenticated user cannot update permissions" do
            put organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id),
              params: { permission: :edit },
              as: :json

            assert_response :unauthorized
          end

          test "query count" do
            sign_in @member.user

            assert_query_count 13 do
              put organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id),
                params: { permission: :edit },
                as: :json
            end
          end
        end

        context "#destroy" do
          before do
            @other_member = create(:organization_membership, organization: @org)
            @permission = create(:permission, subject: @note, user: @other_member.user, action: :view)
          end

          test "author can destroy permission" do
            sign_in @member.user

            delete organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id)

            assert_response :no_content
            assert @permission.reload.discarded?
          end

          test "viewer permission cannot destroy permission" do
            other_member = create(:organization_membership, organization: @org)
            create(:permission, subject: @note, user: other_member.user, action: :view)
            sign_in other_member.user

            delete organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id)

            assert_response :forbidden
            assert_not @permission.reload.discarded?
          end

          test "editor permission can destroy permission" do
            other_member = create(:organization_membership, organization: @org)
            create(:permission, subject: @note, user: other_member.user, action: :edit)
            sign_in other_member.user

            delete organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id)

            assert_response :no_content
            assert @permission.reload.discarded?
          end

          test "member not part of the organization cannot destroy permissions" do
            sign_in create(:organization_membership, organization: @org).user

            delete organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id)

            assert_response :forbidden
            assert_not @permission.reload.discarded?
          end

          test "project viewer cannot destroy permissions" do
            project_viewer_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user

            delete organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id)

            assert_response :forbidden
            assert_not @permission.reload.discarded?
          end

          test "project editor can destroy permissions" do
            project_editor_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user

            delete organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id)

            assert_response :no_content
            assert @permission.reload.discarded?
          end

          test "member not part of private project cannot destroy permissions" do
            private_project = create(:project, :private, organization: @org)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @org).user

            delete organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id)

            assert_response :forbidden
            assert_not @permission.reload.discarded?
          end

          test "random user cannot destroy permissions" do
            sign_in create(:user)

            delete organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id)

            assert_response :forbidden
            assert_not @permission.reload.discarded?
          end

          test "unauthenticated user cannot destroy permissions" do
            delete organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id)

            assert_response :unauthorized
            assert_not @permission.reload.discarded?
          end

          test "query count" do
            sign_in @member.user

            assert_query_count 12 do
              delete organization_note_permission_path(@org.slug, @note.public_id, @permission.public_id)
            end
          end
        end
      end
    end
  end
end
