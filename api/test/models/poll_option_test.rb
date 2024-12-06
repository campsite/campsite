# frozen_string_literal: true

require "test_helper"

class PollOptionTest < ActiveSupport::TestCase
  context "#validations" do
    test "is not valid for description > 32 characters" do
      option = build(:poll_option, description: "a" * 33)

      assert_not_predicate option, :valid?
      assert_match(/Description should be less than 32 characters/, option.errors.full_messages.first)
    end
  end

  context "#vote_percent" do
    test "calculates the vote percentage across all poll options" do
      poll = create(:poll)
      option_a = create(:poll_option, poll: poll)
      option_b = create(:poll_option, poll: poll)

      create_list(:poll_vote, 2, poll_option: option_a)
      create_list(:poll_vote, 3, poll_option: option_b)

      assert_equal 40, option_a.reload.votes_percent
      assert_equal 60, option_b.reload.votes_percent
    end

    test "floors the vote percentage result" do
      poll = create(:poll)
      option_a = create(:poll_option, poll: poll)
      option_b = create(:poll_option, poll: poll)

      create_list(:poll_vote, 1, poll_option: option_a)
      create_list(:poll_vote, 2, poll_option: option_b)

      assert_equal 33, option_a.reload.votes_percent
      assert_equal 66, option_b.reload.votes_percent
    end

    test "returns 0 if poll.votes_count=0" do
      poll = create(:poll)
      option_a = create(:poll_option, poll: poll)
      option_b = create(:poll_option, poll: poll)

      assert_equal 0, option_a.reload.votes_percent
      assert_equal 0, option_b.reload.votes_percent
    end
  end

  context "#destroy!" do
    test "updates the poll.votes_count" do
      poll = create(:poll)
      option = create(:poll_option, poll: poll)
      create_list(:poll_vote, 2, poll_option: option)
      assert_equal 2, poll.reload.votes_count

      option.destroy!

      assert_equal 0, poll.reload.votes_count
    end
  end
end
