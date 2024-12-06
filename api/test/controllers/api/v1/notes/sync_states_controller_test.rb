# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notes
      class SyncStatesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @note = create(:note, description_html: "<p>foo bar</p>", description_state: "1234_foo_bar_5678", description_schema_version: 1)
          @member = @note.member
          @org = @member.organization
          @project = create(:project, organization: @org)
        end

        context "#show" do
          test "author can get description" do
            sign_in(@member.user)
            get organization_note_sync_state_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal "1234_foo_bar_5678", json_response["description_state"]
            assert_equal "<p>foo bar</p>", json_response["description_html"]
            assert_equal 1, json_response["description_schema_version"]
          end

          test "viewer permission can get description" do
            other_member = create(:organization_membership, :member, organization: @org)
            create(:permission, user: other_member.user, subject: @note, action: :view)

            sign_in other_member.user
            get organization_note_sync_state_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "editor permission can get description" do
            other_member = create(:organization_membership, :member, organization: @org)
            create(:permission, user: other_member.user, subject: @note, action: :edit)

            sign_in other_member.user
            get organization_note_sync_state_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "member not part of the organization cannot get description" do
            sign_in create(:organization_membership, :member, organization: @org).user
            get organization_note_sync_state_path(@org.slug, @note.public_id)

            assert_response :forbidden
          end

          test "project viewer can get description" do
            project_viewer_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user
            get organization_note_sync_state_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "project editor can get description" do
            project_editor_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user
            get organization_note_sync_state_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "member not part of private project cannot get description" do
            private_project = create(:project, :private, organization: @org)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @org).user
            get organization_note_sync_state_path(@org.slug, @note.public_id)

            assert_response :forbidden
          end

          test "does not work for random user" do
            sign_in create(:user)
            get organization_note_sync_state_path(@org.slug, @note.public_id)
            assert_response :forbidden
          end

          test "does not work without auth" do
            get organization_note_sync_state_path(@org.slug, @note.public_id)
            assert_response :unauthorized
          end

          test "does not work for discarded notes" do
            @note.discard!
            sign_in(@member.user)
            get organization_note_sync_state_path(@org.slug, @note.public_id)
            assert_response :not_found
          end
        end

        context "#update" do
          test "author can update description" do
            sign_in(@member.user)
            put organization_note_sync_state_path(@org.slug, @note.public_id),
              params: {
                description_html: "<p>cat dog</p>",
                description_state: "9876_cat_dog_5432",
                description_schema_version: 2,
              },
              as: :json

            assert_response :ok
            assert_response_gen_schema

            assert_equal "9876_cat_dog_5432", @note.reload.description_state
            assert_equal "<p>cat dog</p>", @note.description_html
            assert_equal 2, @note.description_schema_version
            assert_equal @member.user.display_name, @note.events.last.metadata.dig("actor_display_name")
          end

          test "cannot update with older schema" do
            sign_in(@member.user)
            put organization_note_sync_state_path(@org.slug, @note.public_id),
              params: {
                description_html: "<p>cat dog</p>",
                description_state: "9876_cat_dog_5432",
                description_schema_version: 0,
              },
              as: :json

            assert_response :unprocessable_entity
          end

          test "viewer permission can update description" do
            other_member = create(:organization_membership, :member, organization: @org)
            create(:permission, user: other_member.user, subject: @note, action: :view)

            sign_in other_member.user
            put organization_note_sync_state_path(@org.slug, @note.public_id),
              params: {
                description_html: "<p>cat dog</p>",
                description_state: "9876_cat_dog_5432",
                description_schema_version: 2,
              },
              as: :json

            assert_response :ok
            assert_response_gen_schema
          end

          test "editor permission can update description" do
            other_member = create(:organization_membership, :member, organization: @org)
            create(:permission, user: other_member.user, subject: @note, action: :edit)

            sign_in other_member.user
            put organization_note_sync_state_path(@org.slug, @note.public_id),
              params: {
                description_html: "<p>cat dog</p>",
                description_state: "9876_cat_dog_5432",
                description_schema_version: 2,
              },
              as: :json

            assert_response :ok
            assert_response_gen_schema
          end

          test "member not part of the organization cannot update description" do
            sign_in create(:organization_membership, :member, organization: @org).user
            put organization_note_sync_state_path(@org.slug, @note.public_id),
              params: {
                description_html: "<p>cat dog</p>",
                description_state: "9876_cat_dog_5432",
                description_schema_version: 2,
              },
              as: :json

            assert_response :forbidden
          end

          test "project viewer can update description" do
            project_viewer_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user
            put organization_note_sync_state_path(@org.slug, @note.public_id),
              params: {
                description_html: "<p>cat dog</p>",
                description_state: "9876_cat_dog_5432",
                description_schema_version: 2,
              },
              as: :json

            assert_response :ok
            assert_response_gen_schema
          end

          test "project editor can update description" do
            project_editor_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user
            put organization_note_sync_state_path(@org.slug, @note.public_id),
              params: {
                description_html: "<p>cat dog</p>",
                description_state: "9876_cat_dog_5432",
                description_schema_version: 2,
              },
              as: :json

            assert_response :ok
            assert_response_gen_schema
          end

          test "member not part of private project cannot update description" do
            private_project = create(:project, :private, organization: @org)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @org).user
            put organization_note_sync_state_path(@org.slug, @note.public_id),
              params: {
                description_html: "<p>cat dog</p>",
                description_state: "9876_cat_dog_5432",
                description_schema_version: 2,
              },
              as: :json

            assert_response :forbidden
          end

          test "does not work for random user" do
            sign_in create(:user)
            put organization_note_sync_state_path(@org.slug, @note.public_id),
              params: {
                description_html: "<p>cat dog</p>",
                description_state: "9876_cat_dog_5432",
                description_schema_version: 2,
              },
              as: :json
            assert_response :forbidden
          end

          test "does not work without auth" do
            put organization_note_sync_state_path(@org.slug, @note.public_id),
              params: {
                description_html: "<p>cat dog</p>",
                description_state: "9876_cat_dog_5432",
                description_schema_version: 2,
              },
              as: :json
            assert_response :unauthorized
          end

          test "works for discarded notes" do
            @note.discard!
            sign_in(@member.user)
            put organization_note_sync_state_path(@org.slug, @note.public_id),
              params: {
                description_html: "<p>cat dog</p>",
                description_state: "9876_cat_dog_5432",
                description_schema_version: 2,
              },
              as: :json

            assert_response :ok
            assert_response_gen_schema
          end
        end
      end
    end
  end
end
