# frozen_string_literal: true

class CalDotComTokenAccess
  ALLOWED_ROUTES = {
    "api/v1/integrations/cal_dot_com/call_rooms" => [:create], # POST /v1/integrations/cal_dot_com/call_rooms
  }

  def self.allowed?(controller:, action:)
    action = action.to_sym

    ALLOWED_ROUTES[controller]&.include?(action) == true
  end
end
