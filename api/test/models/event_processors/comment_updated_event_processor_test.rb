# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class CommentUpdatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @post_author_member = create(:organization_membership, organization: @org)
        @post = create(:post, member: @post_author_member, organization: @org)
      end

      test "notifies new mentions" do
        old_mention_member = create(:organization_membership, organization: @org)
        new_mention_member = create(:organization_membership, organization: @org)
        comment = create(:comment, subject: @post, body_html: "<p>#{MentionsFormatter.format_mention(old_mention_member)}</p>")
        comment.update!(body_html: "<p>#{MentionsFormatter.format_mention(new_mention_member)}</p>")
        event = comment.events.updated_action.first!

        event.process!

        assert_not old_mention_member.notifications.mention.find_by(event: event)
        assert new_mention_member.notifications.mention.find_by(event: event)
      end

      test "does not send a second notification if mentioned users didn't change" do
        mentioned_member = create(:organization_membership, organization: @org)
        comment = create(:comment, subject: @post, body_html: "<p>#{MentionsFormatter.format_mention(mentioned_member)}</p>")
        created_event = comment.events.created_action.first!
        created_event.process!

        assert_predicate created_event.notifications.where(organization_membership: mentioned_member), :one?

        comment.update!(body_html: "<p>hi #{MentionsFormatter.format_mention(mentioned_member)}</p>")
        updated_event = comment.events.updated_action.first!
        updated_event.process!

        assert_predicate updated_event.notifications.where(organization_membership: mentioned_member), :none?
      end

      test "notifies when resolved" do
        other_member = create(:organization_membership, organization: @org)
        comment = create(:comment, subject: @post)
        comment.resolve!(actor: other_member)
        event = comment.events.updated_action.first!

        event.process!

        assert comment.member.notifications.kept.comment_resolved.find_by(event: event)
      end

      test "does not notify when resolving own comment" do
        comment = create(:comment, subject: @post)
        comment.resolve!(actor: comment.member)
        event = comment.events.updated_action.first!

        event.process!

        assert_not comment.member.notifications.kept.comment_resolved.find_by(event: event)
      end

      test "clears notification when unresolving" do
        other_member = create(:organization_membership, organization: @org)
        comment = create(:comment, subject: @post)
        comment.resolve!(actor: other_member)

        event = comment.events.updated_action.last!
        event.process!

        assert_equal 1, comment.notifications.kept.comment_resolved.count

        comment.unresolve!(actor: other_member)
        event = comment.events.updated_action.last!
        event.process!

        assert_equal 0, comment.notifications.kept.comment_resolved.count
      end

      test "does not renotify when updating other values" do
        other_member = create(:organization_membership, organization: @org)
        comment = create(:comment, subject: @post)
        comment.resolve!(actor: other_member)
        resolve_event = comment.events.updated_action.last!

        resolve_event.process!

        assert_equal 1, comment.member.notifications.comment_resolved.where(event: resolve_event).size

        comment.update!(body_html: "<p>hi</p>")
        update_event = comment.reload.events.updated_action.last!
        assert_not_equal update_event, resolve_event

        update_event.process!

        assert_equal 1, comment.member.notifications.comment_resolved.where(event: resolve_event).size
        assert_equal 0, comment.member.notifications.comment_resolved.where(event: update_event).size
      end

      test "creates timeline events for post references" do
        post_reference = create(:post, organization: @org)
        comment = create(:comment, subject: @post)

        comment.events.created_action.first!.process!

        assert_equal 0, post_reference.timeline_events.count

        comment.update!(body_html: <<-HTML,
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
                       )

        comment.events.updated_action.first!.process!

        assert_equal 1, post_reference.timeline_events.count
        comment_reference_timeline_event = post_reference.timeline_events.first
        assert_equal "subject_referenced_in_internal_record", comment_reference_timeline_event.action
        assert_equal comment, comment_reference_timeline_event.comment_reference
        assert_nil comment_reference_timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "removes timeline events for removed post references" do
        post_reference = create(:post, organization: @org)
        comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
        )

        comment.events.created_action.first!.process!
        assert_equal 1, post_reference.timeline_events.count

        comment.update!(body_html: "")
        comment.events.updated_action.first!.process!

        assert_equal 0, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "does not create multipe timeline events for the same post reference" do
        post_reference = create(:post, organization: @org)
        comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
        )

        comment.events.created_action.first!.process!

        assert_equal 1, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "does not create timeline events for circular post reference" do
        comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{@post.url}"></link-unfurl>
        HTML
        )

        comment.events.created_action.first!.process!

        assert_equal 0, @post.timeline_events.count
      end

      test "creates timeline events for comment references" do
        post = create(:post, organization: @org)
        comment_reference = create(:comment, subject: post)
        comment = create(:comment, subject: @post)

        comment.events.created_action.first!.process!

        assert_equal 0, post.timeline_events.count

        comment.update!(body_html: <<-HTML,
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
                       )

        comment.events.updated_action.first!.process!

        assert_equal 1, post.timeline_events.count
        comment_reference_timeline_event = post.timeline_events.first
        assert_equal "subject_referenced_in_internal_record", comment_reference_timeline_event.action
        assert_equal comment, comment_reference_timeline_event.comment_reference
        assert_nil comment_reference_timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(post)
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

        comment.update!(body_html: "")
        comment.events.updated_action.first!.process!

        assert_equal 0, post.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post)
      end

      test "does not create multipe timeline events for the same comment reference" do
        post = create(:post, organization: @org)
        comment_reference = create(:comment, subject: post)
        comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
        )

        comment.events.created_action.first!.process!

        assert_equal 1, post.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post)
      end

      test "does not create timeline events for circular comment reference" do
        comment_reference = create(:comment, subject: @post)
        create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
        )

        @post.events.created_action.first!.process!

        assert_equal 0, @post.timeline_events.count
      end

      test "creates timeline events for note references" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        comment = create(:comment, subject: @post)

        comment.events.created_action.first!.process!

        assert_equal 0, note_reference.timeline_events.count

        comment.update!(body_html: <<-HTML,
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
                       )

        comment.events.updated_action.first!.process!

        assert_equal 1, note_reference.timeline_events.count
        comment_reference_timeline_event = note_reference.timeline_events.first
        assert_equal "subject_referenced_in_internal_record", comment_reference_timeline_event.action
        assert_equal comment, comment_reference_timeline_event.comment_reference
        assert_nil comment_reference_timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
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

        comment.update!(body_html: "")
        comment.events.updated_action.first!.process!

        assert_equal 0, note_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
      end

      test "does not create multipe timeline events for the same note reference" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        comment = create(:comment, subject: @post, body_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
        )

        comment.events.created_action.first!.process!

        assert_equal 1, note_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
      end

      test "does not create timeline events for circular note reference" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        comment = create(:comment, subject: note_reference, body_html: <<-HTML
          <link-unfurl href="#{note_reference}"></link-unfurl>
        HTML
        )

        comment.events.created_action.first!.process!

        assert_equal 0, note_reference.timeline_events.count
      end

      private

      def assert_enqueued_subject_timeline_stale_pusher_event(subject)
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [subject.channel_name, "timeline-events-stale", nil.to_json])
      end
    end
  end
end
