# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notes
      class TimelineEventsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @note = create(:note)
          @member = @note.member
          @user = @member.user
          @organization = @member.organization
          @project = create(:project, organization: @organization)
          @note.add_to_project!(project: @project)
        end

        context "#index" do
          setup do
            @note.timeline_events.create!(actor: @member, action: :subject_pinned)
            @note.timeline_events.create!(actor: @member, action: :subject_unpinned)
          end

          test "works for org admin" do
            sign_in @user
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
          end

          test "works for org member" do
            other_member = create(:organization_membership, :member, organization: @organization)

            sign_in other_member.user
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
          end

          test "doesn't return post, comment, or note references from private projects without a membership" do
            private_project = create(:project, :private, organization: @organization)
            private_post = create(:post, project: private_project)
            private_comment = create(:comment, subject: private_post, member: private_post.member)
            private_note = create(:note, project: private_project, member: private_post.member)

            @note.timeline_events.create!(actor: private_post.member, action: :subject_referenced_in_internal_record, reference: private_post)
            @note.timeline_events.create!(actor: private_comment.member, action: :subject_referenced_in_internal_record, reference: private_comment)
            @note.timeline_events.create!(actor: private_note.author, action: :subject_referenced_in_internal_record, reference: private_note)

            sign_in @user
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
          end

          test "returns post, comment, and note references from private projects when user has membership" do
            private_project = create(:project, :private, organization: @organization)
            private_post = create(:post, project: private_project)
            private_post_comment = create(:comment, subject: private_post, member: private_post.member)
            private_note = create(:note, project: private_project, member: private_post.member)

            @note.timeline_events.create!(actor: private_post.member, action: :subject_referenced_in_internal_record, reference: private_post)
            @note.timeline_events.create!(actor: private_post_comment.member, action: :subject_referenced_in_internal_record, reference: private_post_comment)
            @note.timeline_events.create!(actor: private_note.author, action: :subject_referenced_in_internal_record, reference: private_note)

            create(:project_membership, project: private_project, organization_membership: @member)

            sign_in @user
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 5, json_response["data"].length
          end

          test "doesn't return private note and comment references without an invite" do
            private_note = create(:note)
            private_note_comment = create(:comment, subject: private_note, member: private_note.author)

            @note.timeline_events.create!(actor: private_note.author, action: :subject_referenced_in_internal_record, reference: private_note)
            @note.timeline_events.create!(actor: private_note_comment.member, action: :subject_referenced_in_internal_record, reference: private_note_comment)

            sign_in @user
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 2, json_response["data"].length
          end

          test "returns private note and comment references when user have permission" do
            private_note = create(:note)
            private_note_comment = create(:comment, subject: private_note, member: private_note.author)

            @note.timeline_events.create!(actor: private_note.author, action: :subject_referenced_in_internal_record, reference: private_note)
            @note.timeline_events.create!(actor: private_note_comment.member, action: :subject_referenced_in_internal_record, reference: private_note_comment)

            create(:permission, user: @user, subject: private_note, action: :view)

            sign_in @user
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 4, json_response["data"].length
          end

          test "returns external record references" do
            external_record = create(:external_record, :linear_issue)

            @note.timeline_events.create!(actor: @member, action: :post_referenced_in_external_record, reference: external_record)

            sign_in @user
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["data"].length
          end

          test "returns projects from note update" do
            to_project = create(:project, organization: @organization)

            @note.timeline_events.create!(actor: @member, action: :subject_project_updated, metadata: { from_project_id: @note.project_id, to_project_id: to_project.id })

            sign_in @user
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["data"].length
            assert_equal @note.project.public_id, json_response["data"][0]["subject_updated_from_project"]["id"]
            assert_equal to_project.public_id, json_response["data"][0]["subject_updated_to_project"]["id"]
          end

          test "doesn't return project without permission from note update" do
            to_project = create(:project, :private, organization: @organization)

            @note.timeline_events.create!(actor: @member, action: :subject_project_updated, metadata: { from_project_id: @note.project_id, to_project_id: to_project.id })

            sign_in @user
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["data"].length
            assert_equal @note.project.public_id, json_response["data"][0]["subject_updated_from_project"]["id"]
            assert_not json_response["data"][0]["subject_updated_to_project"]
          end

          test "returns member actor for oauth application" do
            oauth_application = create(:oauth_application)
            @note.timeline_events.create!(actor: oauth_application, action: :subject_pinned)

            sign_in @user
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema
            assert_equal 3, json_response["data"].length
            assert_equal oauth_application.public_id, json_response["data"][0]["member_actor"]["id"]
          end

          test "query count" do
            sign_in @user

            assert_query_count 10 do
              get organization_note_timeline_events_path(@organization.slug, @note.public_id)
            end

            assert_response :ok
            assert_response_gen_schema
          end

          test "returns 403 for a random user" do
            sign_in create(:user)
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)
            assert_response :forbidden
          end

          test "returns 403 for a random user on a public note" do
            @note.update!(visibility: :public)

            sign_in create(:user)
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)

            assert_response :forbidden
          end

          test "returns 403 for a random user on a private note" do
            @note.remove_from_project!

            sign_in create(:user)
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)

            assert_response :forbidden
          end

          test "return 401 for an unauthenticated user" do
            get organization_note_timeline_events_path(@organization.slug, @note.public_id)
            assert_response :unauthorized
          end

          test "returns 401 for an unauthenticated user on a public note" do
            @note.update!(visibility: :public)

            get organization_note_timeline_events_path(@organization.slug, @note.public_id)

            assert_response :unauthorized
          end
        end
      end
    end
  end
end
