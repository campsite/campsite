# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class ProjectMembershipDestroyedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @member = create(:organization_membership, organization: @org)
        @project = create(:project, organization: @org)
        @project_membership = create(:project_membership, organization_membership: @member, project: @project)
        created_event = @project_membership.events.created_action.first!
        @notification = create(:notification, organization_membership: @member, event: created_event, target: @project)
      end

      test "discards outstanding notifications" do
        @project_membership.discard
        event = @project_membership.events.destroyed_action.first!

        event.process!

        assert_predicate @notification.reload, :discarded?
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [@member.user.channel_name, "project-memberships-stale", nil.to_json])
      end

      context "notifications for project entities" do
        setup do
          post = create(:post, project: @project, organization: @org)
          @post_notification = create(:notification, organization_membership: @member, event: post.events.created_action.first!, target: post)
          note = create(:note, project: @project, project_permission: :view, member: create(:organization_membership, organization: @org))
          note_comment = create(:comment, subject: note)
          @note_notification = create(:notification, organization_membership: @member, event: note_comment.events.created_action.first!, target: note)
          call = create(:call, project: @project, project_permission: :edit)
          call.update!(generated_summary_status: :completed, generated_title_status: :completed)
          @call_notification = create(:notification, organization_membership: @member, event: call.events.updated_action.first!, target: call, reason: :processing_complete)
        end

        test "discards notifications for private project entities the user no longer has access to" do
          @project.update!(private: true)
          @project_membership.discard
          event = @project_membership.events.destroyed_action.first!

          event.process!

          assert_predicate @post_notification.reload, :discarded?
          assert_predicate @note_notification.reload, :discarded?
          assert_predicate @call_notification.reload, :discarded?
        end

        test "does not discard notifications for non-private project entities" do
          @project_membership.discard
          event = @project_membership.events.destroyed_action.first!

          event.process!

          assert_not_predicate @post_notification.reload, :discarded?
          assert_not_predicate @note_notification.reload, :discarded?
          assert_not_predicate @call_notification.reload, :discarded?
        end
      end
    end
  end
end
