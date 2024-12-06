# frozen_string_literal: true

class PublicProjectSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :name
  api_field :accessory, nullable: true
  api_association :organization, blueprint: PublicOrganizationSerializer
end
