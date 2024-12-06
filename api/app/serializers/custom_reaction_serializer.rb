# frozen_string_literal: true

class CustomReactionSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :name
  api_field :file_url
  api_field :created_at

  api_association :creator, blueprint: OrganizationMemberSerializer
end
