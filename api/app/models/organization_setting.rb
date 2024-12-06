# frozen_string_literal: true

class OrganizationSetting < ApplicationRecord
  NEW_SSO_MEMBER_ROLE_NAME_KEY = "new_sso_member_role_name_key"
  KEYS = [
    "enforce_two_factor_authentication",
    "enforce_sso_authentication",
    NEW_SSO_MEMBER_ROLE_NAME_KEY,
  ].freeze

  belongs_to :organization
  validates :key, presence: true, inclusion: { in: KEYS }, uniqueness: { scope: :organization }
  validates :value, presence: true
end
