# frozen_string_literal: true

FactoryBot.define do
  factory :feedback do
    user
    organization
    description { "this is a bug" }
    feedback_type { "bug" }
    current_url { "/example" }
    browser_info { "Chrome 120.0.0.0 (Apple desktop)" }
    os_info { "Mac 10.15.7" }
    screenshot_path { "/screenshots/1.png" }
  end
end
