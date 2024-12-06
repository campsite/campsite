# frozen_string_literal: true

class ResourceMentionSerializer < ApiSerializer
  api_field :url, name: :id
  api_association :post, blueprint: ResourceMentionPostSerializer, nullable: true
  api_association :call, blueprint: ResourceMentionCallSerializer, nullable: true
  api_association :note, blueprint: ResourceMentionNoteSerializer, nullable: true
  api_normalize "resource_mention"
end
