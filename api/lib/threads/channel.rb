# frozen_string_literal: true

module Threads
  class Channel
    def initialize(payload)
      @data = JSON.parse(payload)
    end

    attr_reader :data

    def name
      data["name"]
    end

    def channel_id
      data["channelID"]
    end

    def member_ids
      data["memberIDs"]
    end

    def private?
      privacy == "private"
    end

    private

    def privacy
      data["privacy"]
    end
  end
end
