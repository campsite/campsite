# frozen_string_literal: true

class OrganizationMemberPageSerializer < ApiSerializer
  api_page OrganizationMemberSerializer
  api_field :total_count, { type: :number }
end
