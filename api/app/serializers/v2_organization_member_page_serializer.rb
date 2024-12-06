# frozen_string_literal: true

class V2OrganizationMemberPageSerializer < ApiSerializer
  api_page V2OrganizationMemberSerializer
  api_field :total_count, { type: :number }
end
