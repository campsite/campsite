# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notes
      class AttachmentsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @note = create(:note)
          @member = @note.member
          @organization = @member.organization
          @project = create(:project, organization: @organization)
        end

        context "#create" do
          test "author can add attachments" do
            attachment_name = "my-image.png"
            attachment_size = 1.megabyte
            assert_equal 0, @note.attachments.count

            sign_in @member.user
            post organization_note_attachments_path(@organization.slug, @note.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png", name: attachment_name, size: attachment_size },
              as: :json

            assert_response :created
            assert_response_gen_schema

            assert_equal 1, @note.reload.attachments.count
            assert_not_nil json_response["id"]
            assert_equal attachment_name, json_response["name"]
            assert_equal attachment_size, json_response["size"]
          end

          test "viewer permission cannot add attachments" do
            other_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: other_member.user, subject: @note, action: :view)

            sign_in other_member.user
            post organization_note_attachments_path(@organization.slug, @note.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png", name: "my-image.png", size: 1.megabyte },
              as: :json

            assert_response :forbidden
          end

          test "editor permission can add attachments" do
            other_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: other_member.user, subject: @note, action: :edit)

            sign_in other_member.user
            post organization_note_attachments_path(@organization.slug, @note.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png", name: "my-image.png", size: 1.megabyte },
              as: :json

            assert_response :created
            assert_response_gen_schema
          end

          test "project viewer cannot add attachments" do
            project_viewer_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user
            post organization_note_attachments_path(@organization.slug, @note.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png", name: "my-image.png", size: 1.megabyte },
              as: :json

            assert_response :forbidden
          end

          test "project editor can add attachments" do
            project_editor_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user
            post organization_note_attachments_path(@organization.slug, @note.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png", name: "my-image.png", size: 1.megabyte },
              as: :json

            assert_response :created
            assert_response_gen_schema
          end

          test "member not part of private project cannot show attachment" do
            private_project = create(:project, :private, organization: @organization)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @organization).user
            post organization_note_attachments_path(@organization.slug, @note.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png", name: "my-image.png", size: 1.megabyte },
              as: :json

            assert_response :forbidden
          end

          test "non-author cannot add attachments" do
            sign_in create(:organization_membership, :member, organization: @organization).user
            post organization_note_attachments_path(@organization.slug, @note.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png" },
              as: :json

            assert_response :forbidden
          end

          test "random user cannot add attachments" do
            sign_in create(:user)
            post organization_note_attachments_path(@organization.slug, @note.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png" },
              as: :json

            assert_response :forbidden
          end

          test "cannot add attachments without auth" do
            post organization_note_attachments_path(@organization.slug, @note.public_id),
              params: { file_type: "image/png", file_path: "/path/to/image1.png" },
              as: :json

            assert_response :unauthorized
          end
        end

        context "#destroy" do
          before do
            @attachment = create(:attachment, file_path: "/path/to/image1.png", subject: @note)
          end

          test "post author can destroy attachments" do
            assert_equal 1, @note.reload.attachments.count

            sign_in @member.user
            delete organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 0, @note.reload.attachments.count
          end

          test "non-author cannot destroy attachments" do
            sign_in create(:organization_membership, :member, organization: @organization).user
            delete organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id)

            assert_response :forbidden
            assert_equal 1, @note.reload.attachments.count
          end

          test "retries if database deadlocks" do
            Attachment.any_instance.stubs(:destroy!).raises(ActiveRecord::Deadlocked).then.raises(ActiveRecord::Deadlocked).then.returns(true)

            sign_in @member.user
            delete organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "viewer cannot destroy attachments" do
            other_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: other_member.user, subject: @note, action: :view)

            sign_in other_member.user
            delete organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id)

            assert_response :forbidden
            assert_equal 1, @note.reload.attachments.count
          end

          test "editor can destroy attachments" do
            other_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: other_member.user, subject: @note, action: :edit)

            sign_in other_member.user
            delete organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 0, @note.reload.attachments.count
          end

          test "project viewer cannot destroy attachments" do
            project_viewer_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user
            delete organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id)

            assert_response :forbidden
            assert_equal 1, @note.reload.attachments.count
          end

          test "project editor can destroy attachments" do
            project_editor_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user
            delete organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 0, @note.reload.attachments.count
          end

          test "member not part of private project cannot destroy attachment" do
            private_project = create(:project, :private, organization: @organization)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @organization).user
            delete organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id)

            assert_response :forbidden
            assert_equal 1, @note.reload.attachments.count
          end

          test "non-author cannot destroy attachments" do
            sign_in create(:organization_membership, :member, organization: @organization).user
            delete organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id)
            assert_response :forbidden
          end

          test "random user cannot destroy attachments" do
            sign_in create(:user)
            delete organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id)
            assert_response :forbidden
          end

          test "cannot destroy attachments without auth" do
            delete organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id)
            assert_response :unauthorized
          end
        end

        context "#update" do
          setup do
            @attachment = create(:attachment, subject: @note)
            @new_preview_file_path = "/path/to/image2.png"
            @new_width = 100
            @new_height = 200
          end

          test "author can update preview_file_path, width, and height" do
            sign_in @member.user
            put organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id),
              params: { preview_file_path: @new_preview_file_path, width: @new_width, height: @new_height },
              as: :json

            assert_response :ok
            assert_response_gen_schema
            assert_includes json_response["preview_url"], @new_preview_file_path
            assert_equal @new_width, json_response["width"]
            assert_equal @new_height, json_response["height"]
          end

          test "non-author cannot update attachment" do
            sign_in create(:organization_membership, :member, organization: @organization).user
            put organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id),
              params: { preview_file_path: @new_preview_file_path, width: @new_width, height: @new_height },
              as: :json

            assert_response :forbidden
          end

          test "viewer cannot update attachments" do
            other_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: other_member.user, subject: @note, action: :view)

            sign_in other_member.user
            put organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id),
              params: { preview_file_path: @new_preview_file_path, width: @new_width, height: @new_height },
              as: :json

            assert_response :forbidden
          end

          test "editor can update attachments" do
            other_member = create(:organization_membership, :member, organization: @organization)
            create(:permission, user: other_member.user, subject: @note, action: :edit)

            sign_in other_member.user
            put organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id),
              params: { preview_file_path: @new_preview_file_path, width: @new_width, height: @new_height },
              as: :json

            assert_response :ok
            assert_response_gen_schema
          end

          test "project viewer cannot update attachments" do
            project_viewer_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user
            put organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id),
              params: { preview_file_path: @new_preview_file_path, width: @new_width, height: @new_height },
              as: :json

            assert_response :forbidden
          end

          test "project editor can update attachments" do
            project_editor_member = create(:organization_membership, :member, organization: @organization)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user
            put organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id),
              params: { preview_file_path: @new_preview_file_path, width: @new_width, height: @new_height },
              as: :json

            assert_response :ok
            assert_response_gen_schema
          end

          test "member not part of private project cannot update attachment" do
            private_project = create(:project, :private, organization: @organization)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @organization).user
            put organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id),
              params: { preview_file_path: @new_preview_file_path, width: @new_width, height: @new_height },
              as: :json

            assert_response :forbidden
          end

          test "non-author cannot update attachments" do
            sign_in create(:organization_membership, :member, organization: @organization).user
            put organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id),
              params: { preview_file_path: @new_preview_file_path, width: @new_width, height: @new_height },
              as: :json
            assert_response :forbidden
          end

          test "random user cannot update attachments" do
            sign_in create(:user)
            put organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id),
              params: { preview_file_path: @new_preview_file_path, width: @new_width, height: @new_height },
              as: :json
            assert_response :forbidden
          end

          test "cannot update attachments without auth" do
            put organization_note_attachment_path(@organization.slug, @note.public_id, @attachment.public_id),
              params: { preview_file_path: @new_preview_file_path, width: @new_width, height: @new_height },
              as: :json
            assert_response :unauthorized
          end
        end
      end
    end
  end
end
