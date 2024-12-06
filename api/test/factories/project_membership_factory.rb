# frozen_string_literal: true

FactoryBot.define do
  factory :project_membership do
    project
    organization_membership { association :organization_membership, organization: project.organization }
  end
end
