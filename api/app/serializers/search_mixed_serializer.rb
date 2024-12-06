# frozen_string_literal: true

class SearchMixedSerializer < ApiSerializer
  api_association :items, blueprint: SearchMixedItemSerializer, is_array: true
  api_association :posts, blueprint: SearchPostSerializer, is_array: true
  api_association :calls, blueprint: SearchCallSerializer, is_array: true
  api_association :notes, blueprint: SearchNoteSerializer, is_array: true
end
