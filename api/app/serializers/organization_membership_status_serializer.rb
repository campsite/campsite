# frozen_string_literal: true

class OrganizationMembershipStatusSerializer < ApiSerializer
  api_field :message
  api_field :emoji
  api_field :expiration_setting, enum: OrganizationMembershipStatus::EXPIRATIONS
  api_field :expires_at, nullable: true
  api_field :pause_notifications, type: :boolean

  # TODO: deprecate `expires_in` once all clients are updated
  api_field :expiration_setting, name: :expires_in, enum: OrganizationMembershipStatus::EXPIRATIONS
end
