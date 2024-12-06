# frozen_string_literal: true

class ProjectPinSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_association :post, blueprint: PostSerializer, nullable: true
  api_association :note, blueprint: NoteSerializer, nullable: true
  api_association :call, blueprint: CallSerializer, nullable: true
end
