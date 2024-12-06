# frozen_string_literal: true

module Threads
  class Channels
    def initialize(payload)
      @data = JSON.parse(payload)
    end

    attr_reader :data

    def to_a
      data.map { |channel_data| Channel.new(channel_data.to_json) }
    end
  end
end
