# frozen_string_literal: true

FactoryBot.define do
  factory :slack_team_id, class: IntegrationData do
    association :integration, provider: :slack
    name { "team_id" }
    value { "some-team-id" }

    transient do
      organization { nil }
    end

    after(:create) do |integration_data, evaluator|
      if evaluator.organization
        integration_data.integration.update!(owner: evaluator.organization)
      end
    end
  end

  factory :slack_scopes, class: IntegrationData do
    association :integration, provider: :slack
    name { IntegrationData::SCOPES }
    value { "im:write,chat:write,channels:join,channels:read,chat:write,links:read,links:write,team:read,groups:read" }

    transient do
      organization { nil }
    end

    after(:create) do |integration_data, evaluator|
      if evaluator.organization
        integration_data.integration.update!(owner: evaluator.organization)
      end
    end
  end

  factory :linear_organization_id, class: IntegrationData do
    association :integration, :linear
    name { IntegrationData::ORGANIZATION_ID }
    value { "linear-organization-uuid" }
  end
end
