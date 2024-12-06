# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class NoteDestroyedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @note_author = create(:organization_membership, organization: @org)
        @note = create(:note, member: @note_author)
      end

      test "destroys follow-ups for the post" do
        follow_up = create(:follow_up, subject: @note)
        @note.discard
        destroyed_event = @note.reload.events.destroyed_action.first!

        destroyed_event.process!

        assert_not FollowUp.exists?(follow_up.id)
      end

      test "destroys favorites for the note" do
        favorite = create(:favorite, favoritable: @note)
        @note.discard
        destroyed_event = @note.reload.events.destroyed_action.first!

        destroyed_event.process!

        assert_not Favorite.exists?(favorite.id)
      end

      test "discards pins for the note" do
        @note.add_to_project!(project: create(:project, organization: @note.organization))
        pin = create(:project_pin, subject: @note)
        @note.discard
        destroyed_event = @note.reload.events.destroyed_action.first!

        destroyed_event.process!

        assert_predicate pin.reload, :discarded?
      end

      test "discards permission notifications for the note" do
        member = create(:organization_membership, organization: @note.organization)
        permission = create(:permission, user: member.user, subject: @note, action: :view)
        created_event = permission.events.created_action.first!
        created_event.process!
        notification = created_event.notifications.where(organization_membership: member).first!
        @note.discard
        destroyed_event = @note.reload.events.destroyed_action.first!

        destroyed_event.process!

        assert_predicate notification.reload, :discarded?
      end

      test "removes timeline events for removed post references" do
        post_reference = create(:post, organization: @org)
        note = create(:note, member: @note_author, description_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
        )

        note.events.created_action.last!.process!

        assert_equal 1, post_reference.timeline_events.count

        note.discard_by_actor(note.user)
        note.events.destroyed_action.last!.process!

        assert_equal 0, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "removes timeline events for removed comment references" do
        post_reference = create(:post, organization: @org)
        comment_reference = create(:comment, subject: post_reference)
        note = create(:note, member: @note_author, description_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
        )

        note.events.created_action.last!.process!

        assert_equal 1, post_reference.timeline_events.count

        note.discard_by_actor(note.user)
        note.events.destroyed_action.last!.process!

        assert_equal 0, post_reference.reload.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "removes timeline events for removed comment references" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        note = create(:note, member: @note_author, description_html: <<-HTML
        <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
        )

        note.events.created_action.last!.process!

        assert_equal 1, note_reference.timeline_events.count

        note.discard_by_actor(note.user)
        note.events.destroyed_action.last!.process!

        assert_equal 0, note_reference.reload.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
      end

      private

      def assert_enqueued_subject_timeline_stale_pusher_event(subject)
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [subject.channel_name, "timeline-events-stale", nil.to_json])
      end
    end
  end
end
