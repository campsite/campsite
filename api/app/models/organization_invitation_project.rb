# frozen_string_literal: true

class OrganizationInvitationProject < ApplicationRecord
  belongs_to :organization_invitation
  belongs_to :project
end
