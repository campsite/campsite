# frozen_string_literal: true

class IntegrationOrganizationMembershipData < ApplicationRecord
  INTEGRATION_USER_ID = "integration_user_id"
  WELCOMED_AT = "welcomed_at"

  belongs_to :integration_organization_membership
end
