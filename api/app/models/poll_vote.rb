# frozen_string_literal: true

class PollVote < ApplicationRecord
  belongs_to :member, class_name: "OrganizationMembership", optional: true, foreign_key: "organization_membership_id"
  belongs_to :poll_option
  counter_culture :poll_option, column_name: "votes_count"
  counter_culture [:poll_option, :poll], column_name: "votes_count"

  delegate :poll, to: :poll_option

  validate :enforce_non_existing_voter

  private

  def enforce_non_existing_voter
    return unless member
    return unless poll.voted?(member)

    errors.add(:base, "You have already voted in this poll.")
  end
end
