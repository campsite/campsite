# frozen_string_literal: true

class ReactionSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :content, nullable: true

  api_association :member, blueprint: OrganizationMemberSerializer
  api_association :custom_content, blueprint: SyncCustomReactionSerializer, nullable: true
end
