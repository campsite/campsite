# frozen_string_literal: true

FactoryBot.define do
  factory :post_link_preview do
    post
    title { "Campsite designs" }
    description { "best designer website" }
    url { "http://app.campsite.test" }
    service_name { "campsite" }
    service_logo { "http://example.com/favicon.svg" }
  end
end
