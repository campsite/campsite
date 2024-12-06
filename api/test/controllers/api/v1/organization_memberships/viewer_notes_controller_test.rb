# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module OrganizationMemberships
      class ViewerNoteControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @member = create(:organization_membership)
          @user = @member.user
          @organization = @member.organization
        end

        context "#index" do
          test "returns paginated posts for the current org member" do
            notes_mine = create_list(:note, 2, member: @member)

            other_member = create(:organization_membership, organization: @organization)

            notes_shared = create_list(:note, 2, member: other_member)
            create(:permission, :view, user: @member.user, subject: notes_shared[0])
            create(:permission, :edit, user: @member.user, subject: notes_shared[1])

            archived_project = create(:project, :archived, organization: @organization)
            create(:project_membership, project: archived_project, organization_membership: @member)
            archived_project_note = create(:note, member: @member, project: archived_project)
            notes_mine << archived_project_note

            open_project_without_project_membership = create(:project, organization: @organization)
            notes_mine << create(:note, member: @member, project: open_project_without_project_membership)

            @open_project = create(:project, organization: @organization)
            create(:project_membership, project: @open_project, organization_membership: @member)
            open_project_note = create(:note, member: @member, project: @open_project)
            notes_mine << open_project_note

            other_open_project = create(:project, organization: @organization)
            other_open_project_note = create(:note, member: other_member, project: other_open_project)

            notes_org = [
              other_open_project_note,
              open_project_note,
            ]

            note_other_private = create(:note, member: other_member)

            sign_in @user

            assert_query_count 13 do
              get organization_membership_viewer_notes_path(@organization.slug)
            end

            assert_response :ok
            assert_response_gen_schema
            assert_equal 5, json_response["data"].length

            json_ids = json_response["data"].pluck("id")
            assert_equal notes_mine.map(&:public_id).sort, json_ids.sort
            assert_not_includes json_ids, note_other_private.public_id
            assert_not_includes json_ids, notes_org[0].public_id
            assert_not_includes json_ids, notes_shared[0].public_id
          end

          test("notes ordered by created_at properly") do
            sign_in @member.user

            notes = [
              create(:note, member: @member, last_activity_at: 1.day.ago),
              create(:note, member: @member, last_activity_at: 1.hour.ago),
              create(:note, member: @member, last_activity_at: 3.minutes.ago),
              create(:note, member: @member, last_activity_at: 1.minute.ago),
              create(:note, member: @member, last_activity_at: 5.minutes.ago),
            ]

            get organization_membership_viewer_notes_path(@organization.slug), params: { order: { by: "created_at", direction: "desc" } }

            assert_response :ok
            assert_response_gen_schema
            assert_equal notes.reverse.pluck(:public_id), json_response["data"].pluck("id")
          end

          test("notes ordered by last_activity_at properly") do
            sign_in @member.user

            notes = [
              create(:note, member: @member, last_activity_at: 1.day.ago),
              create(:note, member: @member, last_activity_at: 1.hour.ago),
              create(:note, member: @member, last_activity_at: 3.minutes.ago),
              create(:note, member: @member, last_activity_at: 1.minute.ago),
              create(:note, member: @member, last_activity_at: 5.minutes.ago),
            ]

            get organization_membership_viewer_notes_path(@organization.slug), params: { order: { by: "last_activity_at", direction: "desc" } }

            assert_response :ok
            assert_response_gen_schema
            assert_equal [notes[3], notes[2], notes[4], notes[1], notes[0]].pluck(:public_id), json_response["data"].pluck("id")
          end

          test "returns search results" do
            note_1 = create(:note, member: @member, title: "Needle in a haystack")
            create_list(:note, 2, member: @member)

            create(:note, member: create(:organization_membership, organization: @organization), project: @open_project, title: "Needle in a haystack")

            Note.reindex

            sign_in @user

            get organization_membership_viewer_notes_path(@organization.slug), params: { q: "needle" }

            assert_response :ok
            assert_response_gen_schema
            assert_equal [note_1].map(&:public_id), json_response["data"].pluck("id")
          end

          test "403s for a non-org member" do
            sign_in create(:user)
            get organization_membership_viewer_notes_path(@organization.slug)

            assert_response :forbidden
          end

          test "401s for a logged-out user" do
            get organization_membership_viewer_notes_path(@organization.slug)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
