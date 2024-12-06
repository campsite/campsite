# frozen_string_literal: true

require "test_helper"

class SetContentUpdatedAtJobTest < ActiveJob::TestCase
  setup do
    @expected_content_updated_at = 5.days.ago

    @note_allowed_update = create(:note, content_updated_at: nil)
    Timecop.travel(@expected_content_updated_at) do
      @note_allowed_update.update!(description_html: "new")
    end

    Timecop.travel(@expected_content_updated_at) do
      @note_disallowed_update = create(:note, content_updated_at: nil)
    end
    @note_disallowed_update.update!(description_state: "new")

    @note_no_update = create(:note, content_updated_at: nil)
    @note_no_update.events.destroy_all # removing the note created event by factory bot
  end

  context "#perform" do
    test "sets content_updated_at to the most recent allowed event" do
      Timecop.freeze do
        SetContentUpdatedAtJob.new.perform(@note_allowed_update.id)
        SetContentUpdatedAtJob.new.perform(@note_disallowed_update.id)

        assert_in_delta @expected_content_updated_at, @note_allowed_update.reload.content_updated_at, 5.seconds
        assert_in_delta @expected_content_updated_at, @note_disallowed_update.reload.content_updated_at, 5.seconds
      end
    end

    test "sets content_updated_at to created_at if no allowed events exist" do
      Timecop.freeze do
        SetContentUpdatedAtJob.new.perform(@note_no_update.id)

        assert_equal @note_no_update.created_at, @note_no_update.reload.content_updated_at
      end
    end
  end
end
