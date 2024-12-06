# frozen_string_literal: true

class SlackChannelSerializer < ApiSerializer
  api_field :id do |channel|
    channel.respond_to?(:provider_channel_id) ? channel.provider_channel_id : channel.id
  end
  api_field :name
  api_field :is_private, type: :boolean do |channel|
    channel.respond_to?(:private?) ? channel.private? : channel.is_private
  end
end
