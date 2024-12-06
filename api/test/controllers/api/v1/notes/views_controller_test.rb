# frozen_string_literal: true

require "test_helper"

module Api
  module V1
    module Notes
      class ViewsControllerTest < ActionDispatch::IntegrationTest
        include Devise::Test::IntegrationHelpers

        setup do
          @note = create(:note)
          @member = @note.member
          @org = @member.organization
          @project = create(:project, organization: @org)
        end

        context "#index" do
          before do
            @views = create_list(:note_view, 3, note: @note)
          end

          test "author can view all views" do
            sign_in @member.user
            get organization_note_views_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response.size
            assert_equal @views[2].organization_membership.public_id, json_response[0]["member"]["id"]
            assert_equal @views[1].organization_membership.public_id, json_response[1]["member"]["id"]
            assert_equal @views[0].organization_membership.public_id, json_response[2]["member"]["id"]
          end

          test "doesnt include author" do
            create(:note_view, note: @note, organization_membership: @member)

            sign_in @member.user
            get organization_note_views_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response.size
            assert_not_includes json_response.map { |view| view["member"]["id"] }, @member.public_id
          end

          test "viewer can view all views" do
            other_member = create(:organization_membership, :member, organization: @org)
            create(:permission, user: other_member.user, subject: @note, action: :view)

            sign_in other_member.user
            get organization_note_views_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response.size
          end

          test "editor can view all views" do
            other_member = create(:organization_membership, :member, organization: @org)
            create(:permission, user: other_member.user, subject: @note, action: :edit)

            sign_in other_member.user
            get organization_note_views_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response.size
          end

          test "project viewer can view all views" do
            project_viewer_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user
            get organization_note_views_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response.size
          end

          test "project editor can view all views" do
            project_editor_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user
            get organization_note_views_path(@org.slug, @note.public_id)

            assert_response :ok
            assert_response_gen_schema

            assert_equal 3, json_response.size
          end

          test "member not part of private project cannot view views" do
            private_project = create(:project, :private, organization: @org)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @org).user
            get organization_note_views_path(@org.slug, @note.public_id)

            assert_response :forbidden
          end

          test "non-permitted member cannot view views" do
            sign_in create(:organization_membership, organization: @org).user
            get organization_note_views_path(@org.slug, @note.public_id)

            assert_response :forbidden
          end

          test "random user cannot view views" do
            sign_in create(:organization_membership).user
            get organization_note_views_path(@org.slug, @note.public_id)

            assert_response :forbidden
          end

          test "unauthenticated user cannot view views" do
            get organization_note_views_path(@org.slug, @note.public_id)

            assert_response :unauthorized
          end

          test "query count" do
            sign_in @member.user
            assert_query_count 5 do
              get organization_note_views_path(@org.slug, @note.public_id)
            end
          end
        end

        context "#create" do
          test "author can create view" do
            sign_in @member.user

            assert_difference -> { @note.views.count }, 1 do
              post organization_note_views_path(@org.slug, @note.public_id)
            end

            assert_response :created
            assert_response_gen_schema

            view = NoteView.last
            assert_equal @member, view.organization_membership
            assert_equal @note, view.note
            assert_equal 0, json_response["views"].size
          end

          test "creating a view clears and returns the notification" do
            create(:comment, subject: @note).events.first.process!
            assert_equal 1, @member.user.unread_notifications_count

            sign_in @member.user

            assert_difference -> { @note.views.count }, 1 do
              post organization_note_views_path(@org.slug, @note.public_id)
            end

            assert_response :created
            assert_response_gen_schema

            assert_equal 0, @member.user.unread_notifications_count
            assert_equal 0, json_response["notification_counts"]["inbox"].values.sum
            assert_equal 0, json_response["notification_counts"]["messages"].values.sum
          end

          test "creating a new view sends a pusher event" do
            sign_in @member.user

            PusherTriggerJob.expects(:perform_async).with(@note.channel_name, "views-stale", { user_id: @member.user.public_id }.to_json)

            post organization_note_views_path(@org.slug, @note.public_id)
          end

          test "update a new view does not send a pusher event" do
            sign_in @member.user

            create(:note_view, note: @note, organization_membership: @member)

            PusherTriggerJob.expects(:perform_async).with(@note.channel_name, "views-stale", anything).never

            post organization_note_views_path(@org.slug, @note.public_id)
          end

          test "viewer can create view" do
            other_member = create(:organization_membership, organization: @org)
            create(:permission, user: other_member.user, subject: @note, action: :view)

            sign_in other_member.user

            assert_difference -> { @note.views.count }, 1 do
              post organization_note_views_path(@org.slug, @note.public_id)
            end

            assert_response :created
            assert_response_gen_schema

            view = NoteView.last
            assert_equal other_member, view.organization_membership
            assert_equal @note, view.note
            assert_equal 0, json_response["views"].size
          end

          test "editor can create view" do
            other_member = create(:organization_membership, organization: @org)
            create(:permission, user: other_member.user, subject: @note, action: :edit)

            sign_in other_member.user

            assert_difference -> { @note.views.count }, 1 do
              post organization_note_views_path(@org.slug, @note.public_id)
            end

            assert_response :created
            assert_response_gen_schema
          end

          test "project viewer can create view" do
            project_viewer_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_viewer_member)
            @note.add_to_project!(project: @project, permission: :view)

            sign_in project_viewer_member.user

            assert_difference -> { @note.views.count }, 1 do
              post organization_note_views_path(@org.slug, @note.public_id)
            end

            assert_response :created
            assert_response_gen_schema
          end

          test "project editor can create view" do
            project_editor_member = create(:organization_membership, :member, organization: @org)
            create(:project_membership, project: @project, organization_membership: project_editor_member)
            @note.add_to_project!(project: @project, permission: :edit)

            sign_in project_editor_member.user

            assert_difference -> { @note.views.count }, 1 do
              post organization_note_views_path(@org.slug, @note.public_id)
            end

            assert_response :created
            assert_response_gen_schema
          end

          test "member not part of private project cannot create views" do
            private_project = create(:project, :private, organization: @org)
            @note.add_to_project!(project: private_project, permission: :edit)

            sign_in create(:organization_membership, :member, organization: @org).user

            assert_difference -> { @note.views.count }, 0 do
              post organization_note_views_path(@org.slug, @note.public_id)
            end

            assert_response :forbidden
          end

          test "non-permitted member cannot create views" do
            sign_in create(:organization_membership, organization: @org).user

            assert_difference -> { @note.views.count }, 0 do
              post organization_note_views_path(@org.slug, @note.public_id)
            end

            assert_response :forbidden
          end

          test "random user cannot create views" do
            sign_in create(:organization_membership).user

            assert_difference -> { @note.views.count }, 0 do
              post organization_note_views_path(@org.slug, @note.public_id)
            end

            assert_response :forbidden
          end

          test "unauthenticated user cannot create views" do
            assert_difference -> { @note.views.count }, 0 do
              post organization_note_views_path(@org.slug, @note.public_id)
            end

            assert_response :forbidden
          end

          test "query count" do
            sign_in @member.user

            assert_query_count 16 do
              post organization_note_views_path(@org.slug, @note.public_id)
            end
          end

          test "creates a non member view for a random user" do
            @note.update(visibility: :public)
            user = create(:user)

            sign_in user
            assert_difference -> { NonMemberNoteView.count }, 1 do
              post organization_note_views_path(@org.slug, @note.public_id), headers: { "HTTP_FLY_CLIENT_IP" => "1.2.3.4" }
            end

            assert_response :created
            assert_response_gen_schema
            assert @note.reload.non_member_views.exists?(user: user)
            assert_equal 1, @note.non_member_views_count
          end
        end
      end
    end
  end
end
