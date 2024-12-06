# frozen_string_literal: true

FactoryBot.define do
  factory :open_graph_link do
    url { "https://www.example.com" }
    title { "Example" }
    image_path { nil }
  end
end
