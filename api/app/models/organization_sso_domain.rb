# frozen_string_literal: true

class OrganizationSsoDomain < ApplicationRecord
  belongs_to :organization
  validates :domain, presence: true, uniqueness: true
  validate :enforce_valid_domain

  delegate :sso_connection, to: :organization

  private

  def enforce_valid_domain
    return unless domain
    return if PublicSuffix.valid?(domain)

    errors.add(:base, "One or more of the domains provided are invalid.")
  end
end
