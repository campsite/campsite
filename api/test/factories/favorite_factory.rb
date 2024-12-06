# frozen_string_literal: true

FactoryBot.define do
  factory :favorite do
    favoritable { create(:project) }
    organization_membership { association :organization_membership, organization: favoritable.organization }

    trait :project do
      favoritable { create(:project, creator: organization_membership) }
    end

    trait :message_thread do
      favoritable { create(:message_thread, :group, owner: organization_membership) }
    end
  end
end
