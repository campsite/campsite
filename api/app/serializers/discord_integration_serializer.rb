# frozen_string_literal: true

class DiscordIntegrationSerializer < ApiSerializer
  field :id, Blueprint::Types::Serializer.new(PublicIdSerializer)
  field :discord_guild_id
  field :guild_name
  field :has_private_channel_scopes, type: :boolean
  field :token, if: ->(_, options) { options[:view] == :with_token }

  def discord_guild_id
    object.owner.discord_guild_id
  end

  def guild_name
    object.data.find_by(name: IntegrationData::ACCOUNT_NAME)&.value
  end

  def has_private_channel_scopes
    object.scopes&.include?("guilds.channels.read")
  end
end