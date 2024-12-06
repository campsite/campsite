# frozen_string_literal: true

class MessageThreadMembershipSerializer < ApiSerializer
  api_field :notification_level, enum: MessageThreadMembership.notification_levels.keys
end
