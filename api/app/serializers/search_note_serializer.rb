# frozen_string_literal: true

class SearchNoteSerializer < ApiSerializer
  NOTE_INCLUDES = [
    :project,
    member: OrganizationMembership::SERIALIZER_EAGER_LOAD,
  ].freeze

  api_field :public_id, name: :id
  api_field :title
  api_field :created_at

  api_association :member, blueprint: OrganizationMemberSerializer
  api_association :project, blueprint: MiniProjectSerializer, nullable: true
end
