# frozen_string_literal: true

class OrganizationInvitationPageSerializer < ApiSerializer
  api_page OrganizationInvitationSerializer
  api_field :total_count, type: :number
end
