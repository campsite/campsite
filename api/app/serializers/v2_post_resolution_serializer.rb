# frozen_string_literal: true

class V2PostResolutionSerializer < ApiSerializer
  api_field :resolved_at
  api_field :resolved_html, nullable: true
  api_association :resolved_by, blueprint: V2AuthorSerializer
  api_association :resolved_comment, blueprint: V2CommentSerializer, nullable: true
end
