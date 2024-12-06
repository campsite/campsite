# frozen_string_literal: true

class OrganizationSettingsSerializer < ApiSerializer
  api_field :enforce_two_factor_authentication, type: :boolean
  api_field :enforce_sso_authentication, type: :boolean
end
