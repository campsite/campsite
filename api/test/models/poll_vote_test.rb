# frozen_string_literal: true

require "test_helper"

class PollVoteTest < ActiveSupport::TestCase
  context "#validations" do
    test "is not valid for an existing voter" do
      member = create(:organization_membership)
      option = create(:poll_option)
      create(:poll_vote, poll_option: option, member: member)

      new_vote = build(:poll_vote, poll_option: option, member: member)
      assert_not_predicate new_vote, :valid?
      assert_match(/You have already voted in this poll/, new_vote.errors.full_messages.first)
    end
  end
end
