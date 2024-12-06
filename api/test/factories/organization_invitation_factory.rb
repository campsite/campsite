# frozen_string_literal: true

FactoryBot.define do
  factory :organization_invitation do
    organization
    association :sender, factory: :user
    sequence(:email) { |n| "user-invite#{n}@example.com" }
    role { Role::ADMIN_NAME }

    trait :with_recipient do
      after(:build) do |invitation|
        invitation.recipient = create(:user, email: invitation.email) unless invitation.recipient
      end
    end

    trait :member do
      role { Role::MEMBER_NAME }
    end

    trait :viewer do
      role { Role::VIEWER_NAME }
    end
  end
end
