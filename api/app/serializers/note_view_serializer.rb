# frozen_string_literal: true

class NoteViewSerializer < ApiSerializer
  api_field :updated_at
  api_association :organization_membership, name: :member, blueprint: OrganizationMemberSerializer
end
