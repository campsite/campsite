# frozen_string_literal: true

FactoryBot.define do
  factory :data_export_resource do
    data_export
    resource_type { :users }

    trait :completed do
      status { :completed }
      completed_at { Time.current }
    end
  end
end
