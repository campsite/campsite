# frozen_string_literal: true

class SyncTokenAccess
  ALLOWED_ROUTES = {
    "api/v1/notes/sync_states" => [:show, :update], # GET /v1/organizations/:org_slug/notes/:post_id/sync_state, PUT /v1/organizations/:org_slug/notes/:post_id/sync_state
    "api/v1/users" => [:me], # GET /v1/users/me
  }

  def self.allowed?(controller:, action:)
    action = action.to_sym

    ALLOWED_ROUTES[controller]&.include?(action) == true
  end
end
