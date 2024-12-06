# frozen_string_literal: true

class CalDotComIntegrationSerializer < ApiSerializer
  api_field :installed_cal_dot_com_integration?, name: :installed, type: :boolean
  api_association :cal_dot_com_organization, name: :organization, blueprint: PublicOrganizationSerializer
end
