# frozen_string_literal: true

require "test_helper"

require "test_helpers/rack_attack_helper"

module Api
  module V1
    module Notes
      module Attachments
        class CommentsControllerTest < ActionDispatch::IntegrationTest
          include Devise::Test::IntegrationHelpers

          setup do
            @note = create(:note)
            @member = @note.member
            @org = @member.organization
            @project = create(:project, organization: @org)
            @attachments = [
              create(:attachment, subject: @note),
              create(:attachment, subject: @note),
            ]
          end

          context "#index" do
            before do
              @comment11, @comment12 = create_list(:comment, 2, subject: @note, attachment: @attachments[0])
              @comment21 = create(:comment, subject: @note, attachment: @attachments[1])
            end

            test "returns only comments on attachment" do
              sign_in @member.user

              get organization_note_attachment_comments_path(@org.slug, @note.public_id, @attachments[0].public_id)

              assert_response :ok
              assert_response_gen_schema
              assert_equal [@comment11, @comment12].map(&:public_id).sort, json_response["data"].pluck("id").sort

              get organization_note_attachment_comments_path(@org.slug, @note.public_id, @attachments[1].public_id)

              assert_response :ok
              assert_response_gen_schema
              assert_equal @comment21.public_id, json_response["data"].first["id"]
            end

            test "works for viewer" do
              other_member = create(:organization_membership, :member, organization: @org)
              create(:permission, user: other_member.user, subject: @note, action: :view)

              sign_in other_member.user

              get organization_note_attachment_comments_path(@org.slug, @note.public_id, @attachments[0].public_id)

              assert_response :ok
              assert_response_gen_schema
              assert_equal [@comment11, @comment12].map(&:public_id).sort, json_response["data"].pluck("id").sort
            end

            test "works for editor" do
              other_member = create(:organization_membership, :member, organization: @org)
              create(:permission, user: other_member.user, subject: @note, action: :edit)

              sign_in other_member.user

              get organization_note_attachment_comments_path(@org.slug, @note.public_id, @attachments[0].public_id)

              assert_response :ok
              assert_response_gen_schema
              assert_equal [@comment11, @comment12].map(&:public_id).sort, json_response["data"].pluck("id").sort
            end

            test "works for project viewer" do
              project_viewer_member = create(:organization_membership, :member, organization: @org)
              create(:project_membership, project: @project, organization_membership: project_viewer_member)
              @note.add_to_project!(project: @project, permission: :view)

              sign_in project_viewer_member.user

              get organization_note_attachment_comments_path(@org.slug, @note.public_id, @attachments[0].public_id)

              assert_response :ok
              assert_response_gen_schema
              assert_equal [@comment11, @comment12].map(&:public_id).sort, json_response["data"].pluck("id").sort
            end

            test "works for project editor" do
              project_editor_member = create(:organization_membership, :member, organization: @org)
              create(:project_membership, project: @project, organization_membership: project_editor_member)
              @note.add_to_project!(project: @project, permission: :edit)

              sign_in project_editor_member.user

              get organization_note_attachment_comments_path(@org.slug, @note.public_id, @attachments[0].public_id)

              assert_response :ok
              assert_response_gen_schema
              assert_equal [@comment11, @comment12].map(&:public_id).sort, json_response["data"].pluck("id").sort
            end

            test "does not work for member not part of private project" do
              private_project = create(:project, :private, organization: @org)
              @note.add_to_project!(project: private_project, permission: :edit)

              sign_in create(:organization_membership, :member, organization: @org).user

              get organization_note_attachment_comments_path(@org.slug, @note.public_id, @attachments[0].public_id)

              assert_response :forbidden
            end

            test "does not work for other member" do
              sign_in create(:organization_membership, :member, organization: @org).user

              get organization_note_attachment_comments_path(@org.slug, @note.public_id, @attachments[0].public_id)

              assert_response :forbidden
            end

            test "does not work for random user" do
              sign_in create(:user)

              get organization_note_attachment_comments_path(@org.slug, @note.public_id, @attachments[0].public_id)

              assert_response :forbidden
            end

            test "does not work without user" do
              get organization_note_attachment_comments_path(@org.slug, @note.public_id, @attachments[0].public_id)

              assert_response :forbidden
            end
          end
        end
      end
    end
  end
end
