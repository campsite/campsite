# frozen_string_literal: true

class GoogleCalendarIntegrationSerializer < ApiSerializer
  api_field :installed_google_calendar_integration?, name: :installed, type: :boolean
  api_association :google_calendar_organization, name: :organization, blueprint: PublicOrganizationSerializer
end
