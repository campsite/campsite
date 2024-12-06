# frozen_string_literal: true

FactoryBot.define do
  factory :integration_organization_membership do
    organization_membership
    integration { create(:integration, :slack, owner: organization_membership.organization) }
  end
end
