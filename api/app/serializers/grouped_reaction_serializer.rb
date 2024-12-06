# frozen_string_literal: true

class GroupedReactionSerializer < ApiSerializer
  api_field :viewer_reaction_id, nullable: true
  api_field :emoji, nullable: true
  api_field :tooltip
  api_field :reactions_count, type: :number

  api_association :custom_content, blueprint: SyncCustomReactionSerializer, nullable: true
end
