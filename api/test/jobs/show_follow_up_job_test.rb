# frozen_string_literal: true

require "test_helper"

class ShowFollowUpJobTest < ActiveJob::TestCase
  describe "#perform" do
    test "shows a follow up if show_at has passed and not already shown" do
      Timecop.freeze do
        follow_up = create(:follow_up, show_at: 2.minutes.ago)

        ShowFollowUpJob.new.perform(follow_up.id)

        assert_in_delta follow_up.reload.shown_at, Time.current, 2.seconds
      end
    end

    test "does not show a follow up if show_at has not passed" do
      follow_up = create(:follow_up, show_at: 2.minutes.from_now)

      ShowFollowUpJob.new.perform(follow_up.id)

      assert_nil follow_up.reload.shown_at, Time.current
    end

    test "does not show a follow up if already shown" do
      Timecop.freeze do
        original_shown_at = 1.minute.ago
        follow_up = create(:follow_up, show_at: 2.minutes.ago, shown_at: original_shown_at)

        ShowFollowUpJob.new.perform(follow_up.id)

        assert_in_delta follow_up.reload.shown_at, original_shown_at, 2.seconds
      end
    end

    test "no-op if follow up has been deleted" do
      follow_up = create(:follow_up, show_at: 2.minutes.ago)
      follow_up.destroy!

      assert_nothing_raised do
        ShowFollowUpJob.new.perform(follow_up.id)
      end
    end
  end
end
