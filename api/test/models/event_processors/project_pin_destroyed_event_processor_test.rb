# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class ProjectPinDestroyedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      before(:each) do
        @org = create(:organization)
      end

      test "deletes previous post pinned timeline event if new post unpinned timeline event is created by same actor within rollup threshold" do
        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          post = create(:post, organization: @org)

          project_pin = create(:project_pin, subject: post)
          project_pin.events.created_action.first!.process!

          project_pin.discard
          project_pin.events.destroyed_action.first!.process!

          assert_predicate project_pin.reload, :discarded?
          assert_equal 0, post.timeline_events.count
        end
      end

      test "creates post unpinned timeline event if previous post pinned timeline event is longer than rollup threshold" do
        post = create(:post, organization: @org)
        project_pin = nil

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          project_pin = create(:project_pin, subject: post)
          project_pin.events.created_action.first!.process!
        end

        Timecop.freeze((TimelineEvent::ROLLUP_THRESHOLD_SECONDS * 2).from_now) do
          project_pin.discard
          project_pin.events.destroyed_action.first!.process!

          timeline_event = post.timeline_events.last!

          assert_predicate project_pin.reload, :discarded?
          assert_equal 2, post.timeline_events.count
          assert_equal "subject_unpinned", timeline_event.action
          assert_nil timeline_event.metadata
        end
      end

      test "creates post unpinned timeline event if previous post pinned timeline event has different actor" do
        post = create(:post, organization: @org)
        project_pin = nil

        Timecop.freeze(TimelineEvent::ROLLUP_THRESHOLD_SECONDS.from_now) do
          project_pin = create(:project_pin, subject: post)
          project_pin.events.created_action.first!.process!

          project_pin.discard_by_actor(post.author)
          project_pin.events.destroyed_action.first!.process!

          timeline_event = post.timeline_events.last!

          assert_predicate project_pin.reload, :discarded?
          assert_equal 2, post.timeline_events.count
          assert_equal "subject_unpinned", timeline_event.action
          assert_nil timeline_event.metadata
        end
      end
    end
  end
end
