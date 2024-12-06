# frozen_string_literal: true

FactoryBot.define do
  factory :slack_user_id, class: IntegrationOrganizationMembershipData do
    association :integration_organization_membership
    name { IntegrationOrganizationMembershipData::INTEGRATION_USER_ID }
    value { "some-user-id" }

    transient do
      integration { nil }
      organization_membership { nil }
    end

    after(:create) do |integration_organization_membership_data, evaluator|
      if evaluator.integration
        integration_organization_membership_data.integration_organization_membership.update!(integration: evaluator.integration)
      end

      if evaluator.organization_membership
        integration_organization_membership_data.integration_organization_membership.update!(organization_membership: evaluator.organization_membership)
      end
    end
  end
end
