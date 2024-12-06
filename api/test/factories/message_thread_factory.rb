# frozen_string_literal: true

FactoryBot.define do
  factory :message_thread do
    association :owner, factory: :organization_membership

    trait :group do
      group { true }

      organization_memberships { [owner, *create_list(:organization_membership, 3, organization: owner.organization)] }
    end

    trait :dm do
      organization_memberships { [owner, create(:organization_membership, organization: owner.organization)] }
    end

    trait :app_dm do
      owner { create(:oauth_application, :organization) }
      organization_memberships { [create(:organization_membership, organization: owner.organization)] }
      oauth_applications { [owner] }
      group { false }
      members_count { 2 }
    end
  end
end
