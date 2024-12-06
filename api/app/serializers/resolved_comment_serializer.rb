# frozen_string_literal: true

class ResolvedCommentSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :created_at
  api_field :body_html, default: ""

  api_field :url do |comment, options|
    comment.url(options[:organization])
  end

  api_field :viewer_is_author, type: :boolean do |comment, options|
    next false unless options[:member]

    comment.organization_membership_id == options[:member]&.id
  end

  api_association :author, name: :member, blueprint: OrganizationMemberSerializer
end
