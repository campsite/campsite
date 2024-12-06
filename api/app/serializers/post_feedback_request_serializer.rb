# frozen_string_literal: true

class PostFeedbackRequestSerializer < ApiSerializer
  def self.schema_name
    "FeedbackRequest"
  end

  api_field :public_id, name: :id
  api_field :has_replied, type: :boolean

  api_association :member, blueprint: OrganizationMemberSerializer
end
