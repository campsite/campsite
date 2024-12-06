# frozen_string_literal: true

FactoryBot.define do
  factory :post do
    member { association :organization_membership, organization: organization }
    organization
    project { association :project, organization: organization }
    title { "Look at these designs" }
    description_html { "<p>best designs ever</p>" }
    workflow_state { :published }
    published_at { Time.current }

    trait :discarded do
      discarded_at { 5.minutes.ago }
    end

    trait :draft do
      workflow_state { :draft }
      published_at { nil }
    end

    trait :with_attachments do
      after(:create) do |post|
        create(:attachment, subject: post)
      end
    end

    trait :with_links do
      after(:create) do |post|
        create(:post_link, post: post)
      end
    end

    trait :with_reactions do
      after(:create) do |post|
        create(:reaction, subject: post)
      end
    end

    trait :with_tags do
      after(:create) do |post|
        create(:post_tagging, post: post)
      end
    end

    trait :with_viewers do
      after(:create) do |post|
        create(:post_view, :read, post: post)
        create(:post_view, :read, post: post)
        create(:post_view, :read, post: post)
      end
    end

    trait :with_poll do
      after(:create) do |post|
        create(:poll, :with_options, post: post)
      end
    end

    trait :with_feedback do
      after(:create) do |post|
        create(:post_feedback_request, post: post)
        create(:post_feedback_request, post: post)
      end
    end

    trait :from_integration do
      member { nil }
      title { nil }
      description_html { "<p>Pull request closed</p>" }
      integration { association :integration, :zapier, owner: organization }
    end

    trait :from_oauth_application do
      member { nil }
      title { nil }
      description_html { "<p>Pull request closed</p>" }
      oauth_application { association :oauth_application, :zapier }
    end

    trait :parent do
      association :parent, factory: :post

      after(:build) do |post|
        post.member = post.parent.member
      end
    end

    trait :feedback_requested do
      status { "feedback_requested" }
    end

    trait :stale do
      stale { true }
    end

    trait :resolved do
      resolved_at { 5.minutes.ago }
    end

    # NOTE: This should be the last trait in the list so `reindex` is called
    # after all the other callbacks complete.
    trait :reindex do
      after(:create) do |post|
        post.reindex(refresh: true)
      end
    end
  end
end
