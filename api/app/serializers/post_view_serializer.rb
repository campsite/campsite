# frozen_string_literal: true

class PostViewSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :updated_at
  api_association :member, blueprint: OrganizationMemberSerializer
end
