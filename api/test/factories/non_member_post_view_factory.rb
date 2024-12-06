# frozen_string_literal: true

FactoryBot.define do
  factory :non_member_post_view do
    association :post, factory: :post
    anonymized_ip { IpAnonymizer.mask_ip(Faker::Internet.ip_v4_address) }
  end
end
