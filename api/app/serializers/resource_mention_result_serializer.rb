# frozen_string_literal: true

class ResourceMentionResultSerializer < ApiSerializer
  api_association :item, blueprint: ResourceMentionSerializer
  api_association :project, blueprint: MiniProjectSerializer, nullable: true
end
