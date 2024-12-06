# frozen_string_literal: true

class IntegrationOrganizationMembership < ApplicationRecord
  belongs_to :integration
  belongs_to :organization_membership
  has_many :data, class_name: "IntegrationOrganizationMembershipData"

  scope :slack, -> { joins(:integration).where(integrations: { provider: :slack }) }

  def find_or_initialize_data(name)
    data.find_or_initialize_by(name: name)
  end
end
