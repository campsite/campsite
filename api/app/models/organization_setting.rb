# frozen_string_literal: true

class OrganizationSetting < ApplicationRecord
  KEYS = [
    "enforce_two_factor_authentication",
  ].freeze

  belongs_to :organization
  validates :key, presence: true, inclusion: { in: KEYS }, uniqueness: { scope: :organization }
  validates :value, presence: true
end
