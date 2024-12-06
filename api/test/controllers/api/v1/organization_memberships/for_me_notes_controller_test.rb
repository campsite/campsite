# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module OrganizationMemberships
      class ForMeNotesControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @user = @member.user
          @organization = @member.organization

          other_member = create(:organization_membership, organization: @organization)

          open_project = create(:project, organization: @organization)
          create(:project_membership, project: open_project, organization_membership: @member)
          @joined_open_project_note = create(:note, project: open_project, member: other_member)
          @joined_open_project_deleted_note = create(:note, :discarded, project: open_project, member: other_member)

          private_project = create(:project, :private, organization: @organization)
          create(:project_membership, project: private_project, organization_membership: @member)
          @joined_private_project_note = create(:note, project: private_project, member: other_member)

          archived_project = create(:project, :archived, organization: @organization)
          archived_project.archive!(create(:organization_membership, organization: @organization))
          create(:project_membership, project: archived_project, organization_membership: @member)
          @joined_archived_project_note = create(:note, project: archived_project, member: other_member)

          other_open_project = create(:project, organization: @organization)
          @other_open_project_note = create(:note, project: other_open_project, member: other_member)

          other_private_project = create(:project, :private, organization: @organization)
          @other_private_project_note = create(:note, project: other_private_project, member: other_member)

          @subscribed_note = create(:note, subscribers: [@user], project: other_open_project, member: other_member)

          @other_note = create(:note, member: other_member)
        end

        context "#index" do
          test "returns paginated notes for the current org member" do
            # Ensure comments don't cause N+1
            create_list(:comment, 3, subject: @joined_open_project_note)
            create_list(:comment, 3, subject: @joined_private_project_note)

            sign_in @user

            assert_query_count 15 do
              get organization_membership_for_me_notes_path(@organization.slug)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal [@subscribed_note, @joined_private_project_note, @joined_open_project_note].map(&:public_id), json_response["data"].pluck("id")
            assert_not_includes json_response["data"].pluck("id"), @joined_open_project_deleted_note.public_id
            assert_not_includes json_response["data"].pluck("id"), @joined_archived_project_note.public_id
            assert_not_includes json_response["data"].pluck("id"), @other_note.public_id
            assert_not_includes json_response["data"].pluck("id"), @other_open_project_note.public_id
            assert_not_includes json_response["data"].pluck("id"), @other_private_project_note.public_id
          end

          test "sorts by created_at when specified" do
            @joined_private_project_note.update!(created_at: 1.day.ago)
            @joined_open_project_note.update!(created_at: 1.hour.ago)

            sign_in @user
            get organization_membership_for_me_notes_path(@organization.slug),
              params: { order: { by: "created_at", direction: "desc" } }

            assert_response :ok
            assert_response_gen_schema
            assert_equal [@subscribed_note, @joined_open_project_note, @joined_private_project_note].map(&:public_id), json_response["data"].pluck("id")
          end

          test "403s for a non-org member" do
            sign_in create(:user)
            get organization_membership_for_me_notes_path(@organization.slug)

            assert_response :forbidden
          end

          test "401s for a logged-out user" do
            get organization_membership_for_me_notes_path(@organization.slug)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
