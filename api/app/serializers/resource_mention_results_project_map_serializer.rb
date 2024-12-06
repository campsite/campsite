# frozen_string_literal: true

class ResourceMentionResultsProjectMapSerializer < ApiSerializer
  api_field :url, name: :id
  api_association :project, blueprint: MiniProjectSerializer, nullable: true
end
