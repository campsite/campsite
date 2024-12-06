# frozen_string_literal: true

FactoryBot.define do
  factory :project_view do
    project
    organization_membership
    last_viewed_at { 1.hour.ago }
  end
end
