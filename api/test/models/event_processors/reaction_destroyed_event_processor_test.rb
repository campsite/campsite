# frozen_string_literal: true

require "test_helper"

module EventProcessors
  class ReactionDestroyedEventProcessorTest < ActiveSupport::TestCase
    context "#process!" do
      test "discards a notification for a post reaction" do
        post = create(:post)
        reaction = create(:reaction, subject: post)
        created_event = reaction.events.created_action.first!
        created_event.process!

        reaction.discard
        destroyed_event = reaction.events.destroyed_action.first!
        destroyed_event.process!

        notification = reaction.notifications.first!
        assert_predicate notification, :discarded?
      end

      test "discards a notification for a comment reaction" do
        comment = create(:comment)
        reaction = create(:reaction, subject: comment)
        created_event = reaction.events.created_action.first!
        created_event.process!

        reaction.discard
        destroyed_event = reaction.events.destroyed_action.first!
        destroyed_event.process!

        notification = reaction.notifications.first!
        assert_predicate notification, :discarded?
      end

      test "discards a notification for a reply reaction" do
        reply = create(:comment, parent: create(:comment))
        reaction = create(:reaction, subject: reply)
        created_event = reaction.events.created_action.first!
        created_event.process!

        reaction.discard
        destroyed_event = reaction.events.destroyed_action.first!
        destroyed_event.process!

        notification = reaction.notifications.first!
        assert_predicate notification, :discarded?
      end
    end
  end
end
