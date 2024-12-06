# frozen_string_literal: true

module FigmaEvents
  class Ping < BaseEvent
    TYPE = "PING"

    def handle
      { ok: true }
    end
  end
end
