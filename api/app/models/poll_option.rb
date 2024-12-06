# frozen_string_literal: true

class PollOption < ApplicationRecord
  include PublicIdGenerator

  belongs_to :poll
  has_many :votes, class_name: "PollVote", dependent: :destroy
  has_many :voters, through: :votes, source: :member

  validates :description, length: {
    maximum: 32,
    too_long: "should be less than 32 characters.",
  }

  def votes_percent
    return 0 if poll.votes_count.zero?

    result = (votes_count / poll.votes_count.to_f) * 100
    result.floor
  end

  def voted?(member)
    voters.include?(member)
  end
end
