# frozen_string_literal: true

class DiscordChannel
  def initialize(params)
    @params = params
  end

  def id
    @params["id"]
  end

  def name
    @params["name"]
  end

  def type
    @params["type"]
  end

  def guild_id
    @params["guild_id"]
  end

  def private?
    # Discord channel types: 0 = text, 2 = voice, 4 = category, 5 = news
    # Private channels in Discord are DMs (type 1) or group DMs (type 3)
    [1, 3].include?(@params["type"])
  end

  def text_channel?
    @params["type"] == 0
  end

  def voice_channel?
    @params["type"] == 2
  end
end