# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class NoteCreatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @note_author = create(:organization_membership, organization: @org)
        @note = create(:note, member: @note_author)
      end

      test "create note last_activity_at & content_updated at timestamp" do
        Timecop.freeze do
          @note.events.created_action.first!.process!

          assert_in_delta Time.current, @note.content_updated_at, 2.seconds
          assert_in_delta Time.current, @note.last_activity_at, 2.seconds
        end
      end

      test "creates timeline events for post references" do
        post_reference = create(:post, organization: @org)
        note = create(:note, member: @note_author, description_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
        )

        note.events.created_action.first!.process!

        assert_equal 1, post_reference.timeline_events.count
        note_reference_timeline_event = post_reference.timeline_events.first
        assert_equal "subject_referenced_in_internal_record", note_reference_timeline_event.action
        assert_equal note, note_reference_timeline_event.note_reference
        assert_nil note_reference_timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "does not create multipe timeline events for the same post reference" do
        post_reference = create(:post, organization: @org)
        note = create(:note, member: @note_author, description_html: <<-HTML
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
          <link-unfurl href="#{post_reference.url}"></link-unfurl>
        HTML
        )

        note.events.created_action.first!.process!

        assert_equal 1, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "creates timeline events for comment references" do
        post_reference = create(:post, organization: @org)
        comment_reference = create(:comment, subject: post_reference)
        note = create(:note, member: @note_author, description_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
        )

        note.events.created_action.first!.process!

        assert_equal 1, post_reference.timeline_events.count
        note_reference_timeline_event = post_reference.timeline_events.first
        assert_equal "subject_referenced_in_internal_record", note_reference_timeline_event.action
        assert_equal note, note_reference_timeline_event.note_reference
        assert_nil note_reference_timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "does not create multipe timelines event for the same comment reference" do
        post_reference = create(:post, organization: @org)
        comment_reference = create(:comment, subject: post_reference)
        note = create(:note, member: @note_author, description_html: <<-HTML
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
          <link-unfurl href="#{comment_reference.url}"></link-unfurl>
        HTML
        )

        note.events.created_action.first!.process!

        assert_equal 1, post_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(post_reference)
      end

      test "creates timeline events for note references" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        note = create(:note, member: @note_author, description_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
        )

        note.events.created_action.first!.process!

        assert_equal 1, note_reference.timeline_events.count
        note_reference_timeline_event = note_reference.timeline_events.first
        assert_equal "subject_referenced_in_internal_record", note_reference_timeline_event.action
        assert_equal note, note_reference_timeline_event.note_reference
        assert_nil note_reference_timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
      end

      test "does not create multipe timeline events for the same note reference" do
        note_author = create(:organization_membership, organization: @org)
        note_reference = create(:note, member: note_author)
        note = create(:note, member: @note_author, description_html: <<-HTML
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
          <link-unfurl href="#{note_reference.url}"></link-unfurl>
        HTML
        )

        note.events.created_action.first!.process!

        assert_equal 1, note_reference.timeline_events.count

        assert_enqueued_subject_timeline_stale_pusher_event(note_reference)
      end

      private

      def assert_enqueued_subject_timeline_stale_pusher_event(subject)
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [subject.channel_name, "timeline-events-stale", nil.to_json])
      end
    end
  end
end
