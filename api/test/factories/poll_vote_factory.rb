# frozen_string_literal: true

FactoryBot.define do
  factory :poll_vote do
    poll_option
    member { association :organization_membership, organization: poll_option.poll.post.organization }
  end
end
