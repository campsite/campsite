# frozen_string_literal: true

class FollowUpSubjectSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :api_type_name, name: :type
  api_field :follow_up_body_preview, name: :body_preview
  api_association :author, name: :member, blueprint: OrganizationMemberSerializer, nullable: true do |subject|
    subject.try(:author)
  end
  api_field :title, nullable: true do |subject|
    subject.try(:title) || subject.try(:subject)&.try(:title)
  end
end
