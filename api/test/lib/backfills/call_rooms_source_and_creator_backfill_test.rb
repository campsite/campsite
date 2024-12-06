# frozen_string_literal: true

require "test_helper"

module Backfills
  class CallRoomsSourceAndCreatorBackfillTest < ActiveSupport::TestCase
    setup do
      @thread = create(:message_thread)
      @thread_call_room = create(:call_room, subject: @thread)
    end

    describe ".run" do
      test "sets creator and source where possible" do
        Backfills::CallRoomsSourceAndCreatorBackfill.run(dry_run: false)

        assert_equal @thread.owner, @thread_call_room.reload.creator
        assert_equal "subject", @thread_call_room.source
      end

      test "dry run is a no-op" do
        Backfills::CallRoomsSourceAndCreatorBackfill.run

        assert_nil @thread_call_room.reload.creator
        assert_nil @thread_call_room.source
      end
    end
  end
end
