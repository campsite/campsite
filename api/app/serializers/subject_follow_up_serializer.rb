# frozen_string_literal: true

class SubjectFollowUpSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_association :organization_membership, name: :member, blueprint: OrganizationMemberSerializer
  api_field :show_at

  api_field :belongs_to_viewer, type: :boolean do |follow_up, options|
    follow_up.organization_membership == options[:member]
  end
end
