# frozen_string_literal: true

FactoryBot.define do
  factory :webhook_event do
    webhook { association :webhook }
    event_type { "post.created" }
    payload { { "foo" => "bar" } }
    subject { association :post, organization: webhook.owner.owner }
    status { :pending }

    trait :delivered do
      status { :delivered }
    end

    trait :failing do
      status { :failing }
    end

    trait :canceled do
      status { :canceled }
    end
  end
end
