# frozen_string_literal: true

class FollowUpSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :show_at
  api_field :inbox_key
  api_field :organization_slug
  api_association :organization_membership, name: :member, blueprint: OrganizationMemberSerializer
  api_association :subject, blueprint: FollowUpSubjectSerializer
  api_association :notification_target, name: :target, blueprint: NotificationTargetSerializer
  api_field :summary_blocks, blueprint: SummaryBlockSerializer, is_array: true
  api_field :belongs_to_viewer, type: :boolean do |follow_up, options|
    follow_up.organization_membership == options[:member]
  end

  api_normalize "follow_up"
end
