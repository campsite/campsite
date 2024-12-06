# frozen_string_literal: true

class ResourceMentionResultsSerializer < ApiSerializer
  api_association :items, blueprint: ResourceMentionResultSerializer, is_array: true
end
