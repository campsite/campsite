# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class ProjectPinUpdatedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
        @project = create(:project, organization: @org)
      end

      test "deletes previous post unpinned timeline event if new post pinned timeline event is created by same actor within rollup threshold" do
        post = create(:post, organization: @org)
        project_pin = nil

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          project_pin = create(:project_pin, subject: post)
          project_pin.events.created_action.first!.process!
        end

        Timecop.freeze((TimelineEvent::ROLLUP_THRESHOLD_SECONDS * 2).from_now) do
          project_pin.discard
          project_pin.events.destroyed_action.first!.process!

          project_pin.undiscard
          project_pin.events.updated_action.first!.process!

          timeline_event = post.timeline_events.last!

          assert_predicate project_pin.reload, :undiscarded?
          assert_equal 1, post.timeline_events.count
          assert_equal "subject_pinned", timeline_event.action
          assert_nil timeline_event.metadata
        end
      end

      test "creates post pinned timeline event if previous post unpinned timeline event is longer than rollup threshold" do
        post = create(:post, organization: @org)
        project_pin = nil

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          project_pin = create(:project_pin, subject: post)
          project_pin.events.created_action.first!.process!
        end

        Timecop.freeze((TimelineEvent::ROLLUP_THRESHOLD_SECONDS * 2).from_now) do
          project_pin.discard
          project_pin.events.destroyed_action.first!.process!
        end

        Timecop.freeze((TimelineEvent::ROLLUP_THRESHOLD_SECONDS * 3).from_now) do
          project_pin.undiscard
          project_pin.events.updated_action.first!.process!

          timeline_event = post.timeline_events.last!

          assert_predicate project_pin.reload, :undiscarded?
          assert_equal 3, post.timeline_events.count
          assert_equal "subject_pinned", timeline_event.action
          assert_nil timeline_event.metadata
        end
      end

      test "creates post pinned timeline event if previous post unpinned event has different actor" do
        post = create(:post, organization: @org)
        project_pin = nil

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          project_pin = create(:project_pin, subject: post)
          project_pin.events.created_action.first!.process!
        end

        Timecop.freeze((TimelineEvent::ROLLUP_THRESHOLD_SECONDS * 2).from_now) do
          project_pin.discard_by_actor(post.author)
          project_pin.events.destroyed_action.first!.process!

          project_pin.undiscard
          project_pin.events.updated_action.first!.process!

          timeline_event = post.timeline_events.last!

          assert_predicate project_pin.reload, :undiscarded?
          assert_equal 3, post.timeline_events.count
          assert_equal "subject_pinned", timeline_event.action
          assert_nil timeline_event.metadata
        end
      end

      private

      def assert_enqueued_subject_timeline_stale_pusher_event(subject)
        assert_enqueued_sidekiq_job(PusherTriggerJob, args: [subject.channel_name, "timeline-events-stale", nil.to_json])
      end
    end
  end
end
