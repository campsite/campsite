# frozen_string_literal: true

FactoryBot.define do
  factory :post_link do
    association :post, factory: :post
    name { "Campsite designs" }
    url { "http://app.campsite.test" }

    trait :slack do
      name { "slack" }
      url { "https://campsite-software.slack.com/archives/C03J9D4TQKS/p1234567890796459" }
    end
  end
end
