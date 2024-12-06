# frozen_string_literal: true

FactoryBot.define do
  factory :figma_file do
    remote_file_key { SecureRandom.uuid }
    name { Faker::Hobby.activity }
  end
end
