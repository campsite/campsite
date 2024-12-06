# frozen_string_literal: true

require "test_helper"

module Backfills
  class NoteLastActivityAtBackfillTest < ActiveSupport::TestCase
    setup do
      @expected_last_activity_at = 1.second.ago

      # backfill makes last_activity_at == content_updated_at if no comments
      @note_with_no_comments = create(:note)
      @note_with_no_comments.update!(last_activity_at: nil)

      # backfill makes last_activity_at == comment created time if comments
      @note_with_comment = create(:note, content_updated_at: 1.day.ago)
      @note_with_comment.update!(last_activity_at: nil)
      create(:comment, created_at: @expected_last_activity_at, subject: @note_with_comment)

      # backfill makes last_activity_at == content_updated_at if comments deleted
      @note_with_recently_discarded_comment = create(:note, content_updated_at: 2.days.ago)
      @note_with_recently_discarded_comment.update!(last_activity_at: nil)
      create(:comment, :discarded, subject: @note_with_recently_discarded_comment)
      create(:comment, created_at: @expected_last_activity_at, subject: @note_with_recently_discarded_comment)

      # backfill respects content_updated_at
      @note_with_last_activity_at = create(:note, last_activity_at: 3.days.ago)
      create(:comment, created_at: 2.days.ago, subject: @note_with_last_activity_at)
      @note_with_last_activity_at.update!(description_html: "<p>editing text</p>")
      @note_with_last_activity_at.events.updated_action.first!.process!
    end

    describe ".run" do
      test "sets last_activity_at to the most recent of content_updated_at or latest comment created_at" do
        Timecop.freeze do
          assert_query_count 2, true do
            NoteLastActivityAtBackfill.run(dry_run: false)
          end

          assert_in_delta @expected_last_activity_at, @note_with_no_comments.reload.last_activity_at, 5.seconds
          assert_in_delta @expected_last_activity_at, @note_with_comment.reload.last_activity_at, 5.seconds
          assert_in_delta @expected_last_activity_at, @note_with_recently_discarded_comment.reload.last_activity_at, 5.seconds
          assert_in_delta @expected_last_activity_at, @note_with_last_activity_at.reload.last_activity_at, 5.seconds
        end
      end

      test "dry run is a no-op" do
        Timecop.freeze do
          assert_query_count 1 do
            NoteLastActivityAtBackfill.run
          end

          assert_nil @note_with_no_comments.reload.last_activity_at
          assert_nil @note_with_comment.reload.last_activity_at
          assert_nil @note_with_recently_discarded_comment.reload.last_activity_at
          assert_in_delta @expected_last_activity_at, @note_with_last_activity_at.reload.last_activity_at, 5.seconds
        end
      end
    end
  end
end
