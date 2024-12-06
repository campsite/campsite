# frozen_string_literal: true

class PostResolutionSerializer < ApiSerializer
  api_field :resolved_at
  api_association :resolved_by, blueprint: OrganizationMemberSerializer
  api_field :resolved_html, nullable: true
  api_association :resolved_comment, blueprint: ResolvedCommentSerializer, nullable: true
end
