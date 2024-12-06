# frozen_string_literal: true

FactoryBot.define do
  factory :post_digest_note do
    association :post, factory: :post
    association :member, factory: :organization_membership
    association :post_digest, factory: :post_digest
    title { "baz buzz" }
    content { "foo bar" }
  end
end
