# frozen_string_literal: true

FactoryBot.define do
  factory :post_tagging do
    post
    tag
  end
end
