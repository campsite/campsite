# frozen_string_literal: true

class Current < ActiveSupport::CurrentAttributes
  attribute :user, :organization, :organization_membership, :host, :pusher_socket_id
end
