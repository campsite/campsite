# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class ProjectPinCreatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @project = create(:project, organization: @org)
      end

      test "creates post pinned timeline event for post subject" do
        post = create(:post, organization: @org)
        project_pin = create(:project_pin, subject: post)
        project_pin.events.created_action.first!.process!

        timeline_event = post.timeline_events.last!

        assert_predicate project_pin.reload, :undiscarded?
        assert_equal "subject_pinned", timeline_event.action
        assert_nil timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(post)
      end

      test "creates note pinned timeline event for note subject" do
        member = create(:organization_membership, organization: @org)
        note = create(:note, member: member, project: @project)
        project_pin = create(:project_pin, subject: note)
        project_pin.events.created_action.first!.process!

        timeline_event = note.timeline_events.last!

        assert_predicate project_pin.reload, :undiscarded?
        assert_equal "subject_pinned", timeline_event.action
        assert_nil timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(note)
      end

      test "creates call pinned timeline event for call subject" do
        call = create(:call, project: @project)
        project_pin = create(:project_pin, subject: call)
        project_pin.events.created_action.first!.process!

        timeline_event = call.timeline_events.last!

        assert_predicate project_pin.reload, :undiscarded?
        assert_equal "subject_pinned", timeline_event.action
        assert_nil timeline_event.metadata

        assert_enqueued_subject_timeline_stale_pusher_event(call)
      end

      private

      def assert_enqueued_subject_timeline_stale_pusher_event(subject)
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [subject.channel_name, "timeline-events-stale", nil.to_json])
      end
    end
  end
end
