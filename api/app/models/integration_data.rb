# frozen_string_literal: true

class IntegrationData < ApplicationRecord
  # Slack
  SCOPES = "scopes"
  TEAM_ID = "team_id"
  CHANNELS_LAST_SYNCED_AT = "channels_last_synced_at"
  UNRECOGNIZED_USER_ID = "unrecognized_user_id"

  # Linear
  ORGANIZATION_ID = "organization_id"
  TEAMS_LAST_SYNCED_AT = "teams_last_synced_at"

  belongs_to :integration

  validates :name, :value, presence: true
end
