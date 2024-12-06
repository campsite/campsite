# frozen_string_literal: true

require "test_helper"

module Backfills
  class SetContentUpdatedAtBackfillTest < ActiveSupport::TestCase
    setup do
      Timecop.freeze do
        @note_unset = create(:note)
        @note_set = create(:note)

        Timecop.travel(1.day.ago) do
          @note_unset.update!(description_html: "new", content_updated_at: nil)
        end
      end
    end

    context ".run" do
      it "enqueues jobs to update content_updated_at" do
        NoteContentUpdatedAtBackfill.run(dry_run: false)

        assert_enqueued_sidekiq_job(SetContentUpdatedAtJob, args: [@note_unset.id])
        refute_enqueued_sidekiq_job(SetContentUpdatedAtJob, args: [@note_set.id])
      end

      it "no-ops on dry run" do
        NoteContentUpdatedAtBackfill.run

        refute_enqueued_sidekiq_job(SetContentUpdatedAtJob, args: [@note_unset.id])
        refute_enqueued_sidekiq_job(SetContentUpdatedAtJob, args: [@note_set.id])
      end
    end
  end
end
