# frozen_string_literal: true

class SearchGroupSerializer < ApiSerializer
  api_association :tags, blueprint: TagSerializer, is_array: true
  api_association :projects, blueprint: SimpleProjectSerializer, is_array: true
  api_association :members, blueprint: OrganizationMemberSerializer, is_array: true
  api_association :posts, blueprint: SearchPostSerializer, is_array: true
  api_association :calls, blueprint: CallSerializer, is_array: true
  api_association :notes, blueprint: SearchNoteSerializer, is_array: true
  api_field :posts_total_count, type: :number
end
