# frozen_string_literal: true

class GoogleCalendarTokenAccess
  ALLOWED_ROUTES = {
    "api/v1/integrations/google/calendar_events" => [:create], # POST /v1/organizations/:org_slug/integrations/google/calendar_events
    "api/v1/users" => [:me], # GET /v1/users/me
  }

  def self.allowed?(controller:, action:)
    action = action.to_sym

    ALLOWED_ROUTES[controller]&.include?(action) == true
  end
end
