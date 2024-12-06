# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class CommentDestroyedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @author_member = create(:organization_membership, organization: @org)
        @post = create(:post, member: @author_member, organization: @org)
        @note = create(:note, member: @author_member)
      end

      test "discards notifications for the comment" do
        comment = create(:comment, subject: @post)
        created_event = comment.events.created_action.first!
        created_event.process!
        created_notification = created_event.notifications.first!
        assert_not_predicate created_notification, :discarded?

        mentioned_member = create(:organization_membership, organization: @org)
        comment.update!(body_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        updated_event = comment.events.updated_action.first!
        updated_event.process!
        updated_notification = updated_event.notifications.first!
        assert_not_predicate updated_notification, :discarded?

        comment.discard
        destroyed_event = comment.events.destroyed_action.first!
        destroyed_event.process!

        assert_predicate created_notification.reload, :discarded?
        assert_predicate updated_notification.reload, :discarded?
      end

      test "destroys follow ups for the comment" do
        comment = create(:comment, subject: @post)
        follow_up = create(:follow_up, subject: comment)

        comment.discard
        destroyed_event = comment.events.destroyed_action.first!
        destroyed_event.process!

        assert_not FollowUp.exists?(follow_up.id)
      end

      test "enqueues Slack message deletion when message previously delivered" do
        comment = create(:comment, subject: @post)
        created_event = comment.events.created_action.first!
        created_event.process!
        created_notification = created_event.notifications.first!
        created_notification.update!(slack_message_ts: "12345")

        comment.discard
        destroyed_event = comment.events.destroyed_action.first!
        destroyed_event.process!

        assert_enqueued_sidekiq_job(DeleteNotificationSlackMessageJob, args: [created_notification.id])
      end

      test "discards notifications for the comment's replies" do
        comment = create(:comment, subject: @post)
        created_event = comment.events.created_action.first!
        created_event.process!
        created_notification = created_event.notifications.first!
        assert_not_predicate created_notification, :discarded?

        reply = create(:comment, subject: @post, parent: comment)
        reply_created_event = reply.events.created_action.first!
        reply_created_event.process!
        reply_created_notification = reply_created_event.notifications.first!
        assert_not_predicate reply_created_notification, :discarded?

        comment.discard_by_actor(comment.user)
        destroyed_event = comment.events.destroyed_action.first!
        destroyed_event.process!

        reply_destroyed_event = reply.events.destroyed_action.first!
        reply_destroyed_event.process!

        assert_predicate created_notification.reload, :discarded?
        assert_predicate reply_created_notification.reload, :discarded?
      end

      test "updates the post's last_activity_at" do
        Timecop.freeze do
          @post.update!(created_at: 1.day.ago)
          comment = create(:comment, subject: @post)
          created_event = comment.events.created_action.first!
          created_event.process!
          assert_in_delta Time.current, @post.reload.last_activity_at, 2.seconds

          comment.discard_by_actor(comment.user)
          destroyed_event = comment.events.destroyed_action.first!
          destroyed_event.process!

          assert_in_delta @post.reload.published_at, @post.last_activity_at, 2.seconds
        end
      end

      test "updates the note's last_activity_at" do
        Timecop.freeze do
          @note.update!(content_updated_at: 1.day.ago)
          comment = create(:comment, subject: @note)
          created_event = comment.events.created_action.first!
          created_event.process!
          assert_in_delta Time.current, @note.reload.last_activity_at, 2.seconds

          comment.discard_by_actor(comment.user)
          destroyed_event = comment.events.destroyed_action.first!
          destroyed_event.process!
          assert_in_delta @note.reload.content_updated_at, @note.last_activity_at, 2.seconds
        end
      end

      test "deleting a reply updates the post's last_activity_at" do
        post = nil

        Timecop.freeze(2.days.ago) do
          post = create(:post, member: @author_member, organization: @org)
        end

        Timecop.freeze do
          comment = create(:comment, created_at: 1.day.ago, subject: post)
          reply = create(:comment, subject: post, parent: comment)
          created_event = reply.events.created_action.first!
          created_event.process!
          assert_in_delta Time.current, post.reload.last_activity_at, 2.seconds

          reply.discard_by_actor(reply.user)
          destroyed_event = reply.events.destroyed_action.first!
          destroyed_event.process!

          assert_in_delta comment.created_at, post.reload.last_activity_at, 2.seconds
        end
      end

      test "deleting a reply updates the note's last_activity_at" do
        Timecop.freeze do
          @note.update!(content_updated_at: 2.days.ago)
          comment = create(:comment, created_at: 1.day.ago, subject: @note)
          reply = create(:comment, subject: @note, parent: comment)
          created_event = reply.events.created_action.first!
          created_event.process!
          assert_in_delta Time.current, @note.reload.last_activity_at, 2.seconds

          reply.discard_by_actor(reply.user)
          destroyed_event = reply.events.destroyed_action.first!
          destroyed_event.process!

          assert_in_delta comment.created_at, @note.reload.last_activity_at, 2.seconds
        end
      end

      test "enqueues posts-stale event" do
        comment = create(:comment, subject: @post)
        comment.discard_by_actor(comment.user)
        event = comment.events.destroyed_action.first!

        event.process!

        assert_enqueued_sidekiq_job(
          PusherTriggerJob,
          args: [
            @post.organization.channel_name,
            "posts-stale",
            {
              user_id: @post.user.public_id,
              username: @post.user.username,
              project_ids: [@post.project.public_id],
              tag_names: [],
            }.to_json,
          ],
        )
      end

      test "unresolves post for the comment" do
        comment = create(:comment, subject: @post)

        @post.resolve!(actor: @member, html: "<p>resolved</p>", comment_id: comment.public_id)

        comment.discard
        destroyed_event = comment.events.destroyed_action.first!
        destroyed_event.process!

        assert_nil @post.resolved_at
        assert_nil @post.resolved_html
        assert_nil @post.resolved_comment_id
      end

      test "removes timeline events for removed post references" do
        post_reference = create(:post, organization: @org)
        comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
        )

        comment.events.created_action.first!.process!

        assert_equal 1, post_reference.timeline_events.count

        comment.discard_by_actor(comment.user)
        comment.events.destroyed_action.first!.process!

        assert_equal 0, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "removes timeline events for removed comment references" do
        post = create(:post, organization: @org)
        comment_reference = create(:comment, subject: post)
        comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
        )

        comment.events.created_action.first!.process!

        assert_equal 1, post.timeline_events.count

        comment.discard_by_actor(comment.user)
        comment.events.destroyed_action.first!.process!

        assert_equal 0, post.reload.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post)
      end

      test "removes timeline events for removed note references" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
        )

        comment.events.created_action.first!.process!

        assert_equal 1, note_reference.timeline_events.count

        comment.discard_by_actor(comment.user)
        comment.events.destroyed_action.first!.process!

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
