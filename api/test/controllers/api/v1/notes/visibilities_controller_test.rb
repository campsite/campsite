# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notes
      class VisibilitiesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @note = create(:note)
          @member = @note.member
          @org = @member.organization
          @project = create(:project, organization: @org)
        end

        context "#update" do
          test "author can set to visible" do
            sign_in @member.user
            put organization_note_visibility_path(@org.slug, @note.public_id),
              params: { visibility: "public" },
              as: :json

            assert_response :no_content

            assert @note.reload.public_visibility?
            assert_not @note.reload.default_visibility?
          end

          test "author can remove public visibility" do
            @note.update!(visibility: :public)

            sign_in @member.user
            put organization_note_visibility_path(@org.slug, @note.public_id),
              params: { visibility: "default" },
              as: :json

            assert_response :no_content

            assert_not @note.reload.public_visibility?
            assert @note.reload.default_visibility?
          end

          test "viewer cannot update visibility" do
            other_member = create(:organization_membership, :member, organization: @org)
            create(:permission, user: other_member.user, subject: @note, action: :view)

            sign_in other_member.user
            put organization_note_visibility_path(@org.slug, @note.public_id),
              params: { visibility: "public" },
              as: :json

            assert_response :forbidden
            assert_not @note.reload.public_visibility?
          end

          test "editor can update visibility" do
            other_member = create(:organization_membership, :member, organization: @org)
            create(:permission, user: other_member.user, subject: @note, action: :edit)

            sign_in other_member.user
            put organization_note_visibility_path(@org.slug, @note.public_id),
              params: { visibility: "public" },
              as: :json

            assert_response :no_content

            assert @note.reload.public_visibility?
            assert_not @note.reload.default_visibility?
          end

          test "project viewer cannot update visibility" do
            project_viewer_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user
            put organization_note_visibility_path(@org.slug, @note.public_id),
              params: { visibility: "public" },
              as: :json

            assert_response :forbidden
            assert_not @note.reload.public_visibility?
          end

          test "project editor can update visibility" do
            project_editor_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user
            put organization_note_visibility_path(@org.slug, @note.public_id),
              params: { visibility: "public" },
              as: :json

            assert_response :no_content

            assert @note.reload.public_visibility?
            assert_not @note.reload.default_visibility?
          end

          test "member not part of private project cannot update visibility" do
            private_project = create(:project, :private, organization: @org)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @org).user
            put organization_note_visibility_path(@org.slug, @note.public_id),
              params: { visibility: "public" },
              as: :json

            assert_response :forbidden
            assert_not @note.reload.public_visibility?
          end

          test "non-permitted member cannot update visibility" do
            sign_in create(:organization_membership, organization: @org).user
            put organization_note_visibility_path(@org.slug, @note.public_id),
              params: { visibility: "public" },
              as: :json

            assert_response :forbidden
            assert_not @note.reload.public_visibility?
          end

          test "random user cannot update visibility" do
            sign_in create(:organization_membership).user
            put organization_note_visibility_path(@org.slug, @note.public_id),
              params: { visibility: "public" },
              as: :json

            assert_response :forbidden
            assert_not @note.reload.public_visibility?
          end

          test "unauthenticated user cannot update visibility" do
            put organization_note_visibility_path(@org.slug, @note.public_id),
              params: { visibility: "public" },
              as: :json

            assert_response :unauthorized
            assert_not @note.reload.public_visibility?
          end

          test "query count" do
            sign_in @member.user
            assert_query_count 11 do
              put organization_note_visibility_path(@org.slug, @note.public_id),
                params: { visibility: "public" },
                as: :json
            end
          end
        end
      end
    end
  end
end
